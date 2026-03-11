import { z } from 'zod';

export const COMPARATORS = [
  'LessThan',
  'LessThanOrEqualTo',
  'EqualTo',
  'GreaterThanOrEqualTo',
  'GreaterThan',
] as const;

export const comparatorSchema = z.enum(COMPARATORS);

export type Comparator = z.infer<typeof comparatorSchema>;

export interface LordsVotesQueryInput {
  searchTerm?: string;
  memberId?: number;
  includeWhenMemberWasTeller?: boolean;
  startDate?: string;
  endDate?: string;
  divisionNumber?: number;
  totalVotesCastComparator?: Comparator;
  totalVotesCastValueToCompare?: number;
  majorityComparator?: Comparator;
  majorityValueToCompare?: number;
  skip?: number;
  take?: number;
}

export interface SuccessEnvelope {
  ok: true;
  endpoint: string;
  status: number;
  data: unknown;
}

export type ErrorCode =
  | 'INVALID_ARGUMENT'
  | 'NOT_FOUND'
  | 'UNAVAILABLE'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_NETWORK_ERROR'
  | 'UPSTREAM_ERROR';

export interface ErrorEnvelope {
  ok: false;
  endpoint: string;
  status: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export type ToolEnvelope = SuccessEnvelope | ErrorEnvelope;
