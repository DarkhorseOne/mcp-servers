import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import { ENDPOINTS } from './endpoints.generated.js';
import { createStandardEnvelopeForHttp, errorToEnvelope, executeEndpoint, matchEndpointByResolvedPath, runtimeConfigFromEnv } from './core.js';

function parseQuery(searchParams: URLSearchParams): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const keys = new Set(searchParams.keys());
  for (const key of keys) {
    const all = searchParams.getAll(key);
    result[key] = all.length <= 1 ? all[0] : all;
  }
  return result;
}

function writeJsonResponse(res: import('node:http').ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export async function startHttpServer(port = Number(process.env.UKP_HTTP_PORT ?? '8787')): Promise<import('node:http').Server> {
  const runtimeConfig = runtimeConfigFromEnv();

  const server = createServer(async (req, res) => {
    const method = req.method ?? 'GET';
    const origin = `http://${req.headers.host ?? '127.0.0.1'}`;
    const url = new URL(req.url ?? '/', origin);

    if (method === 'GET' && url.pathname === '/healthz') {
      writeJsonResponse(res, 200, {
        status: 'ok',
        tools: ENDPOINTS.length,
        retrieved_at: new Date().toISOString(),
      });
      return;
    }

    if (url.pathname.startsWith('/proxy/')) {
      if (method !== 'GET') {
        writeJsonResponse(res, 405, {
          status: 405,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Only GET is supported for proxied UK Parliament endpoints.',
          },
          upstream_path: '',
          retrieved_at: new Date().toISOString(),
        });
        return;
      }

      const upstreamPath = `/${url.pathname.slice('/proxy/'.length)}`;
      const matched = matchEndpointByResolvedPath(upstreamPath);
      if (!matched) {
        writeJsonResponse(res, 404, {
          status: 404,
          error: {
            code: 'INVALID_PARAMS',
            message: `Unknown endpoint path: ${upstreamPath}`,
            details: {
              available_endpoints: ENDPOINTS.map((endpoint) => endpoint.path),
            },
          },
          upstream_path: upstreamPath,
          retrieved_at: new Date().toISOString(),
        });
        return;
      }

      const rawInput: Record<string, unknown> = {
        ...matched.pathInput,
        ...parseQuery(url.searchParams),
      };

      try {
        const payload = await executeEndpoint(matched.endpoint, rawInput, runtimeConfig);
        const normalizedPayload = createStandardEnvelopeForHttp(payload.status, payload.data, upstreamPath, payload.retrieved_at);
        writeJsonResponse(res, normalizedPayload.status, normalizedPayload);
        return;
      } catch (error) {
        const mapped = errorToEnvelope(error, upstreamPath);
        writeJsonResponse(res, mapped.statusCode, mapped.body);
        return;
      }
    }

    writeJsonResponse(res, 404, {
      status: 404,
      error: {
        code: 'INVALID_PARAMS',
        message: 'Route not found. Use GET /healthz or GET /proxy/<upstream-path>.',
      },
      upstream_path: '',
      retrieved_at: new Date().toISOString(),
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.error(`UK Parliament Questions and Statements HTTP proxy listening on :${port}`);
      resolve();
    });
  });

  return server;
}

const entryPath = process.argv[1];
const isDirectExecution = entryPath !== undefined && fileURLToPath(import.meta.url) === entryPath;

if (isDirectExecution) {
  startHttpServer().catch((error) => {
    console.error('Fatal error in HTTP proxy server:', error);
    process.exit(1);
  });
}
