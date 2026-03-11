import { z } from 'zod';

import { comparatorSchema } from '../types.js';

const sharedQuerySchema = {
  searchTerm: z.string().optional(),
  memberId: z.number().int().optional(),
  includeWhenMemberWasTeller: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  divisionNumber: z.number().int().optional(),
  totalVotesCastComparator: comparatorSchema.optional(),
  totalVotesCastValueToCompare: z.number().int().optional(),
  majorityComparator: comparatorSchema.optional(),
  majorityValueToCompare: z.number().int().optional(),
};

export const TOOL_DEFINITIONS = {
  get_division_by_id: {
    description: 'Get a single Division which has the Id specified.',
    endpointPath: '/data/Divisions/{divisionId}',
    schema: z.object({
      divisionId: z.number().int().describe('Division with ID specified'),
    }),
  },
  search_divisions_total_results: {
    description: 'Get total count of Divisions meeting the specified query, useful for paging lists etc...',
    endpointPath: '/data/Divisions/searchTotalResults',
    schema: z.object(sharedQuerySchema),
  },
  search_divisions: {
    description: 'Get a list of Divisions which meet the specified criteria.',
    endpointPath: '/data/Divisions/search',
    schema: z.object({
      ...sharedQuerySchema,
      skip: z.number().int().default(0).describe('The number of records to skip. Must be a positive integer. Default is 0'),
      take: z.number().int().default(25).describe('The number of records to return per page. Must be more than 0. Default is 25'),
    }),
  },
  get_member_voting_records: {
    description: 'Get a list of voting records for a Member.',
    endpointPath: '/data/Divisions/membervoting',
    schema: z.object({
      ...sharedQuerySchema,
      memberId: z.number().int().min(1).describe('Member ID'),
      skip: z.number().int().default(0).describe('The number of records to skip. Must be a positive integer. Default is 0'),
      take: z.number().int().default(25).describe('The number of records to return per page. Must be more than 0. Default is 25'),
    }),
  },
  get_divisions_grouped_by_party: {
    description: 'Get a list of Divisions which contain grouped by party',
    endpointPath: '/data/Divisions/groupedbyparty',
    schema: z.object(sharedQuerySchema),
  },
} as const;

export type ToolName = keyof typeof TOOL_DEFINITIONS;
