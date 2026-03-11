import { ENDPOINTS, type EndpointDefinition, type EndpointParameter, type ParameterType } from './endpoints.generated.js';

export interface RuntimeConfig {
  apiBaseUrl: string;
  requestTimeoutMs: number;
}

export interface StandardEnvelope extends Record<string, unknown> {
  status: number;
  data: unknown;
  upstream_path: string;
  retrieved_at: string;
}

export interface EndpointErrorEnvelope extends Record<string, unknown> {
  status: number;
  error: {
    code: 'INVALID_PARAMS' | 'UPSTREAM_TIMEOUT' | 'UPSTREAM_ERROR' | 'UPSTREAM_NETWORK_ERROR';
    message: string;
    details?: unknown;
  };
  upstream_path: string;
  retrieved_at: string;
}

export class EndpointValidationError extends Error {
  constructor(
    message: string,
    public readonly details: unknown,
  ) {
    super(message);
    this.name = 'EndpointValidationError';
  }
}

class UpstreamHttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details: unknown,
  ) {
    super(message);
    this.name = 'UpstreamHttpError';
  }
}

function parseNumber(value: unknown, name: string): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  throw new EndpointValidationError(`Invalid number for parameter '${name}'`, { parameter: name, expected: 'number', value });
}

function parseBoolean(value: unknown, name: string): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }
  throw new EndpointValidationError(`Invalid boolean for parameter '${name}'`, { parameter: name, expected: 'boolean', value });
}

function parseString(value: unknown, name: string): string {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  throw new EndpointValidationError(`Invalid string for parameter '${name}'`, { parameter: name, expected: 'string', value });
}

function parseArray(value: unknown, name: string, itemType: 'string' | 'number'): string[] | number[] {
  const source = Array.isArray(value)
    ? value
    : (typeof value === 'string' ? value.split(',').filter((item) => item.length > 0) : null);

  if (!source) {
    throw new EndpointValidationError(`Invalid array for parameter '${name}'`, { parameter: name, expected: `array:${itemType}`, value });
  }

  if (itemType === 'number') {
    return source.map((item) => parseNumber(item, name));
  }

  return source.map((item) => parseString(item, name));
}

function parseParameterValue(type: ParameterType, value: unknown, name: string): string | number | boolean | string[] | number[] {
  if (type === 'number') {
    return parseNumber(value, name);
  }
  if (type === 'boolean') {
    return parseBoolean(value, name);
  }
  if (type === 'array:number') {
    return parseArray(value, name, 'number');
  }
  if (type === 'array:string') {
    return parseArray(value, name, 'string');
  }
  return parseString(value, name);
}

function ensureRequired(parameter: EndpointParameter, value: unknown): void {
  if (!parameter.required) {
    return;
  }
  if (value === undefined || value === null || value === '') {
    throw new EndpointValidationError(`Missing required parameter '${parameter.name}'`, {
      parameter: parameter.name,
      in: parameter.in,
      required: true,
      expected: parameter.type,
      value,
    });
  }
}

function enforceEnumIfPresent(parameter: EndpointParameter, parsedValue: string | number | boolean | string[] | number[]): void {
  if (!parameter.enum || parameter.enum.length === 0) {
    return;
  }

  const allowed = new Set(parameter.enum.map((entry) => String(entry)));

  if (Array.isArray(parsedValue)) {
    for (const item of parsedValue) {
      if (!allowed.has(String(item))) {
        throw new EndpointValidationError(`Invalid enum value for parameter '${parameter.name}'`, {
          parameter: parameter.name,
          allowed: parameter.enum,
          value: parsedValue,
        });
      }
    }
    return;
  }

  if (!allowed.has(String(parsedValue))) {
    throw new EndpointValidationError(`Invalid enum value for parameter '${parameter.name}'`, {
      parameter: parameter.name,
      allowed: parameter.enum,
      value: parsedValue,
    });
  }
}

export function buildUpstreamPath(endpoint: EndpointDefinition, rawInput: Record<string, unknown>): string {
  let path = endpoint.path;

  for (const parameter of endpoint.pathParams) {
    const rawValue = rawInput[parameter.name];
    ensureRequired(parameter, rawValue);

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      continue;
    }

    const parsed = parseParameterValue(parameter.type, rawValue, parameter.name);
    enforceEnumIfPresent(parameter, parsed);
    path = path.replace(`{${parameter.name}}`, encodeURIComponent(String(parsed)));
  }

  const search = new URLSearchParams();
  for (const parameter of endpoint.queryParams) {
    const rawValue = rawInput[parameter.name];
    ensureRequired(parameter, rawValue);

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      continue;
    }

    const parsed = parseParameterValue(parameter.type, rawValue, parameter.name);
    enforceEnumIfPresent(parameter, parsed);

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        search.append(parameter.name, String(item));
      }
    } else {
      search.set(parameter.name, String(parsed));
    }
  }

  const query = search.toString();
  return query.length > 0 ? `${path}?${query}` : path;
}

function normalizeUpstreamData(contentType: string | null, rawBody: string): unknown {
  if (rawBody.length === 0) {
    return null;
  }

  if (contentType?.includes('application/json') || contentType?.includes('text/json')) {
    try {
      return JSON.parse(rawBody) as unknown;
    } catch {
      return rawBody;
    }
  }

  return rawBody;
}

export async function executeEndpoint(endpoint: EndpointDefinition, rawInput: Record<string, unknown>, config: RuntimeConfig): Promise<StandardEnvelope> {
  const upstreamPath = buildUpstreamPath(endpoint, rawInput);
  const upstreamUrl = new URL(upstreamPath, config.apiBaseUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  let response: Response;
  try {
    response = await fetch(upstreamUrl, {
      method: endpoint.method,
      headers: {
        accept: 'application/json, text/json;q=0.9, */*;q=0.8',
      },
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new EndpointValidationError('Upstream timeout', {
        code: 'UPSTREAM_TIMEOUT',
        timeoutMs: config.requestTimeoutMs,
      });
    }

    throw new EndpointValidationError('Failed to reach upstream API', {
      code: 'UPSTREAM_NETWORK_ERROR',
      message: error instanceof Error ? error.message : String(error),
    });
  }

  clearTimeout(timeout);

  const rawBody = await response.text();
  const normalized = normalizeUpstreamData(response.headers.get('content-type'), rawBody);

  if (!response.ok) {
    throw new UpstreamHttpError(`Upstream responded with ${response.status}`, response.status, normalized);
  }

  return {
    status: response.status,
    data: normalized,
    upstream_path: upstreamUrl.pathname,
    retrieved_at: new Date().toISOString(),
  };
}

export function toResolvedPathWithoutQuery(upstreamPath: string): string {
  const queryStart = upstreamPath.indexOf('?');
  return queryStart >= 0 ? upstreamPath.slice(0, queryStart) : upstreamPath;
}

export function createStandardEnvelopeForHttp(
  status: number,
  data: unknown,
  upstreamPath: string,
  retrievedAt = new Date().toISOString(),
): StandardEnvelope {
  return {
    status,
    data,
    upstream_path: toResolvedPathWithoutQuery(upstreamPath),
    retrieved_at: retrievedAt,
  };
}

export function runtimeConfigFromEnv(): RuntimeConfig {
  return {
    apiBaseUrl: process.env.UPSTREAM_BASE_URL ?? 'https://treaties-api.parliament.uk',
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? '10000'),
  };
}

export function errorToEnvelope(error: unknown, fallbackPath = ''): { statusCode: number; body: EndpointErrorEnvelope } {
  const retrievedAt = new Date().toISOString();

  if (error instanceof UpstreamHttpError) {
    return {
      statusCode: error.statusCode,
      body: {
        status: error.statusCode,
        error: {
          code: 'UPSTREAM_ERROR',
          message: error.message,
          details: error.details,
        },
        upstream_path: fallbackPath,
        retrieved_at: retrievedAt,
      },
    };
  }

  if (error instanceof EndpointValidationError) {
    const details = (error.details as { code?: string } | undefined) ?? {};

    if (details.code === 'UPSTREAM_TIMEOUT') {
      return {
        statusCode: 504,
        body: {
          status: 504,
          error: {
            code: 'UPSTREAM_TIMEOUT',
            message: error.message,
            details,
          },
          upstream_path: fallbackPath,
          retrieved_at: retrievedAt,
        },
      };
    }

    if (details.code === 'UPSTREAM_NETWORK_ERROR') {
      return {
        statusCode: 502,
        body: {
          status: 502,
          error: {
            code: 'UPSTREAM_NETWORK_ERROR',
            message: error.message,
            details,
          },
          upstream_path: fallbackPath,
          retrieved_at: retrievedAt,
        },
      };
    }

    return {
      statusCode: 400,
      body: {
        status: 400,
        error: {
          code: 'INVALID_PARAMS',
          message: error.message,
          details: error.details,
        },
        upstream_path: fallbackPath,
        retrieved_at: retrievedAt,
      },
    };
  }

  const message = error instanceof Error ? error.message : 'Unknown internal error';
  return {
    statusCode: 500,
    body: {
      status: 500,
      error: {
        code: 'UPSTREAM_ERROR',
        message,
      },
      upstream_path: fallbackPath,
      retrieved_at: retrievedAt,
    },
  };
}

export function getEndpointByPath(pathname: string): EndpointDefinition | undefined {
  return ENDPOINTS.find((endpoint) => endpoint.path === pathname);
}

export interface MatchedEndpoint {
  endpoint: EndpointDefinition;
  pathInput: Record<string, unknown>;
}

function endpointPathToRegex(path: string): { regex: RegExp; names: string[] } {
  const names: string[] = [];
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escaped.replace(/\\\{([^}]+)\\\}/g, (_, name: string) => {
    names.push(name);
    return '([^/]+)';
  });

  return {
    regex: new RegExp(`^${pattern}$`),
    names,
  };
}

export function matchEndpointByResolvedPath(pathname: string): MatchedEndpoint | undefined {
  for (const endpoint of ENDPOINTS) {
    const { regex, names } = endpointPathToRegex(endpoint.path);
    const match = pathname.match(regex);
    if (!match) {
      continue;
    }

    const pathInput: Record<string, unknown> = {};
    names.forEach((name, index) => {
      const captured = match[index + 1];
      if (captured !== undefined) {
        pathInput[name] = decodeURIComponent(captured);
      }
    });

    return {
      endpoint,
      pathInput,
    };
  }

  return undefined;
}
