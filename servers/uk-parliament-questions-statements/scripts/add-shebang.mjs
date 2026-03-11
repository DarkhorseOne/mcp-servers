import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SHEBANG = '#!/usr/bin/env node';

function ensureShebang(filePath) {
  const content = readFileSync(filePath, 'utf8');
  if (content.startsWith(`${SHEBANG}\n`)) {
    return;
  }

  writeFileSync(filePath, `${SHEBANG}\n${content}`, 'utf8');
}

function main() {
  const distDir = resolve(process.cwd(), 'dist');
  ensureShebang(resolve(distDir, 'index.js'));
  ensureShebang(resolve(distDir, 'http.js'));
}

main();
