import { execFileSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { readFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

function parseTarEntries(buffer) {
  const entries = new Map();
  let offset = 0;

  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    const isEmpty = header.every((value) => value === 0);
    if (isEmpty) {
      break;
    }

    const name = header
      .toString('utf8', 0, 100)
      .replace(/\0.*$/, '')
      .trim();
    const sizeText = header
      .toString('utf8', 124, 136)
      .replace(/\0.*$/, '')
      .trim();
    const size = sizeText.length > 0 ? Number.parseInt(sizeText, 8) : 0;

    const start = offset + 512;
    const end = start + size;
    if (name.length > 0 && end <= buffer.length) {
      entries.set(name, buffer.subarray(start, end));
    }

    const blocks = Math.ceil(size / 512);
    offset = start + blocks * 512;
  }

  return entries;
}

function packTarball() {
  const output = execFileSync('npm', ['pack', '--json', '--silent', '--ignore-scripts'], {
    encoding: 'utf8',
  });
  const parsed = JSON.parse(output);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('npm pack returned unexpected output');
  }

  const filename = parsed[0]?.filename;
  if (typeof filename !== 'string' || filename.length === 0) {
    throw new Error('npm pack output missing tarball filename');
  }

  return resolve(process.cwd(), filename);
}

function main() {
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const bin = packageJson.bin;

  if (!bin || typeof bin !== 'object') {
    throw new Error('package.json has no bin entries to validate');
  }

  const tarballPath = packTarball();

  try {
    const tarBuffer = gunzipSync(readFileSync(tarballPath));
    const entries = parseTarEntries(tarBuffer);

    const missing = [];
    const invalid = [];

    for (const targetPath of Object.values(bin)) {
      if (typeof targetPath !== 'string' || targetPath.length === 0) {
        continue;
      }

      const tarEntryPath = `package/${targetPath}`;
      const content = entries.get(tarEntryPath);
      if (!content) {
        missing.push(tarEntryPath);
        continue;
      }

      const firstLine = content.toString('utf8').split('\n', 1)[0] ?? '';
      if (firstLine.trim() !== '#!/usr/bin/env node') {
        invalid.push(tarEntryPath);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Tarball missing bin target files: ${missing.join(', ')}`);
    }
    if (invalid.length > 0) {
      throw new Error(`Tarball bin targets missing shebang '#!/usr/bin/env node': ${invalid.join(', ')}`);
    }

    process.stdout.write('Tarball shebang verification passed\n');
  } finally {
    unlinkSync(tarballPath);
  }
}

main();
