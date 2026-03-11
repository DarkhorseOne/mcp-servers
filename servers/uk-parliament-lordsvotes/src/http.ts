#!/usr/bin/env node

import { createServer } from 'node:http';

import { runtimeConfigFromEnv } from './config.js';
import { TOOL_DEFINITIONS, type ToolName } from './tools/definitions.js';
import { executeTool } from './tools/handlers.js';

function writeJsonResponse(res: import('node:http').ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

const proxyToolByPath = new Map<string, ToolName>([
  ['/data/Divisions/search', 'search_divisions'],
  ['/data/Divisions/searchTotalResults', 'search_divisions_total_results'],
  ['/data/Divisions/membervoting', 'get_member_voting_records'],
  ['/data/Divisions/groupedbyparty', 'get_divisions_grouped_by_party'],
]);

function parseQuery(searchParams: URLSearchParams): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const keys = new Set(searchParams.keys());
  for (const key of keys) {
    const allValues = searchParams.getAll(key);
    const single = allValues.length <= 1 ? allValues[0] : allValues;

    if (typeof single === 'string') {
      if ((key === 'MemberId' || key === 'DivisionNumber' || key === 'skip' || key === 'take' || key === 'TotalVotesCast.ValueToCompare' || key === 'Majority.ValueToCompare') && single.trim().length > 0) {
        const numeric = Number(single);
        result[key] = Number.isFinite(numeric) ? numeric : single;
        continue;
      }

      if (key === 'IncludeWhenMemberWasTeller') {
        const normalized = single.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') {
          result[key] = true;
          continue;
        }
        if (normalized === 'false' || normalized === '0') {
          result[key] = false;
          continue;
        }
      }
    }

    result[key] = single;
  }
  return result;
}

function getDivisionIdFromPath(pathname: string): number | undefined {
  const match = pathname.match(/^\/data\/Divisions\/(\d+)$/);
  if (!match) {
    return undefined;
  }
  const numeric = Number(match[1]);
  if (!Number.isInteger(numeric)) {
    return undefined;
  }
  return numeric;
}

function normalizeProxyInput(pathname: string, query: Record<string, unknown>): { toolName?: ToolName; input: Record<string, unknown> } {
  const divisionId = getDivisionIdFromPath(pathname);
  if (divisionId !== undefined) {
    return {
      toolName: 'get_division_by_id',
      input: { divisionId },
    };
  }

  const directTool = proxyToolByPath.get(pathname);
  if (!directTool) {
    return { input: {} };
  }

  const input: Record<string, unknown> = {
    searchTerm: query.SearchTerm,
    memberId: query.MemberId,
    includeWhenMemberWasTeller: query.IncludeWhenMemberWasTeller,
    startDate: query.StartDate,
    endDate: query.EndDate,
    divisionNumber: query.DivisionNumber,
    totalVotesCastComparator: query['TotalVotesCast.Comparator'],
    totalVotesCastValueToCompare: query['TotalVotesCast.ValueToCompare'],
    majorityComparator: query['Majority.Comparator'],
    majorityValueToCompare: query['Majority.ValueToCompare'],
    skip: query.skip,
    take: query.take,
  };

  return { toolName: directTool, input };
}

export async function startHttpServer(port = runtimeConfigFromEnv().httpPort): Promise<void> {
  const server = createServer(async (req, res) => {
    const method = req.method ?? 'GET';
    const origin = `http://${req.headers.host ?? '127.0.0.1'}`;
    const url = new URL(req.url ?? '/', origin);

    if (method === 'GET' && url.pathname === '/healthz') {
      writeJsonResponse(res, 200, {
        status: 'ok',
        tools: Object.keys(TOOL_DEFINITIONS).length,
        retrieved_at: new Date().toISOString(),
      });
      return;
    }

    if (!url.pathname.startsWith('/proxy/')) {
      writeJsonResponse(res, 404, {
        status: 404,
        error: {
          code: 'INVALID_ARGUMENT',
          message: 'Route not found. Use GET /healthz or GET /proxy/<upstream-path>.',
        },
      });
      return;
    }

    if (method !== 'GET') {
      writeJsonResponse(res, 405, {
        status: 405,
        error: {
          code: 'INVALID_ARGUMENT',
          message: 'Only GET is supported for proxied Lords Votes endpoints.',
        },
      });
      return;
    }

    const upstreamPath = `/${url.pathname.slice('/proxy/'.length)}`;
    const queryInput = parseQuery(url.searchParams);
    const normalized = normalizeProxyInput(upstreamPath, queryInput);
    if (!normalized.toolName) {
      writeJsonResponse(res, 404, {
        status: 404,
        error: {
          code: 'INVALID_ARGUMENT',
          message: `Unknown endpoint path: ${upstreamPath}`,
          details: {
            available_endpoints: [
              '/data/Divisions/{divisionId}',
              '/data/Divisions/searchTotalResults',
              '/data/Divisions/search',
              '/data/Divisions/membervoting',
              '/data/Divisions/groupedbyparty',
            ],
          },
        },
      });
      return;
    }

    const envelope = await executeTool(normalized.toolName, normalized.input);
    writeJsonResponse(res, envelope.status, envelope);
  });

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.error(`UK Parliament Lords Votes HTTP proxy listening on :${port}`);
      resolve();
    });
  });
}

startHttpServer().catch((error) => {
  console.error('Fatal error in HTTP proxy server:', error);
  process.exit(1);
});
