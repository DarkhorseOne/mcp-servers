import { ToolExecutionError, mapStatusToErrorCode } from './errors.js';
import type { RuntimeConfig } from './config.js';
import type { SuccessEnvelope } from './types.js';

export interface UpstreamRequest {
  endpointPath: string;
  pathParams?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined>;
}

function fillPathParams(path: string, params: Record<string, string | number> | undefined): string {
  if (!params) {
    return path;
  }

  let resolvedPath = path;
  for (const [key, value] of Object.entries(params)) {
    resolvedPath = resolvedPath.replace(`{${key}}`, encodeURIComponent(String(value)));
  }
  return resolvedPath;
}

function buildQueryString(query: Record<string, string | number | boolean | undefined> | undefined): string {
  if (!query) {
    return '';
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }
    search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized.length > 0 ? `?${serialized}` : '';
}

export class LordsVotesApiClient {
  constructor(private readonly config: RuntimeConfig) {}

  async get(request: UpstreamRequest): Promise<SuccessEnvelope> {
    const resolvedPath = fillPathParams(request.endpointPath, request.pathParams);
    const queryString = buildQueryString(request.query);
    const endpoint = `${resolvedPath}${queryString}`;
    const url = new URL(endpoint, this.config.upstreamBaseUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.upstreamTimeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json, text/json;q=0.9, text/plain;q=0.8, */*;q=0.7',
          'user-agent': this.config.userAgent,
        },
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ToolExecutionError('Upstream request timed out', 'UPSTREAM_TIMEOUT', 504, {
          timeoutMs: this.config.upstreamTimeoutMs,
        });
      }

      throw new ToolExecutionError('Failed to reach upstream API', 'UPSTREAM_NETWORK_ERROR', 502, {
        reason: error instanceof Error ? error.message : String(error),
      });
    }

    clearTimeout(timeout);

    const rawBody = await response.text();
    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json') || contentType.includes('text/json');

    let data: unknown;
    if (rawBody.length === 0) {
      data = null;
    } else if (isJson) {
      try {
        data = JSON.parse(rawBody) as unknown;
      } catch {
        data = rawBody;
      }
    } else {
      data = rawBody;
    }

    if (!response.ok) {
      throw new ToolExecutionError(
        `Upstream API returned status ${response.status}`,
        mapStatusToErrorCode(response.status),
        response.status,
        {
          upstreamStatus: response.status,
          upstreamData: data,
        },
      );
    }

    return {
      ok: true,
      endpoint: resolvedPath,
      status: response.status,
      data,
    };
  }
}
