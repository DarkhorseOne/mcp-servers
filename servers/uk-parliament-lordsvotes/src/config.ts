export interface RuntimeConfig {
  upstreamBaseUrl: string;
  upstreamTimeoutMs: number;
  userAgent: string;
  httpPort: number;
}

const DEFAULT_BASE_URL = 'https://lordsvotes-api.parliament.uk';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_HTTP_PORT = 8787;
const DEFAULT_USER_AGENT = '@darkhorseone/mcp-server-uk-parliament-lordsvotes/0.1.0';

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function runtimeConfigFromEnv(): RuntimeConfig {
  return {
    upstreamBaseUrl: process.env.UPSTREAM_BASE_URL ?? DEFAULT_BASE_URL,
    upstreamTimeoutMs: parsePositiveInteger(process.env.UPSTREAM_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    userAgent: process.env.USER_AGENT ?? DEFAULT_USER_AGENT,
    httpPort: parsePositiveInteger(process.env.UKPLV_HTTP_PORT, DEFAULT_HTTP_PORT),
  };
}
