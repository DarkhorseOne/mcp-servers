import type { ErrorCode, ErrorEnvelope } from './types.js';

interface BaseErrorDetails {
  code?: ErrorCode;
  status?: number;
  details?: unknown;
}

export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

export function mapStatusToErrorCode(status: number): ErrorCode {
  if (status === 400) {
    return 'INVALID_ARGUMENT';
  }
  if (status === 404) {
    return 'NOT_FOUND';
  }
  if (status === 503) {
    return 'UNAVAILABLE';
  }
  return 'UPSTREAM_ERROR';
}

export function toErrorEnvelope(error: unknown, endpoint: string): ErrorEnvelope {
  if (error instanceof ToolExecutionError) {
    return {
      ok: false,
      endpoint,
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    const maybe = error as Error & { details?: BaseErrorDetails };
    const details = maybe.details;

    if (details?.code && details.status) {
      return {
        ok: false,
        endpoint,
        status: details.status,
        code: details.code,
        message: error.message,
        details: details.details,
      };
    }

    return {
      ok: false,
      endpoint,
      status: 500,
      code: 'UPSTREAM_ERROR',
      message: error.message,
    };
  }

  return {
    ok: false,
    endpoint,
    status: 500,
    code: 'UPSTREAM_ERROR',
    message: 'Unknown error',
  };
}
