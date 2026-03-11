#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerAllTools, TOOL_COUNT } from './tools/handlers.js';

export function createStdioServer(): McpServer {
  const server = new McpServer({
    name: '@darkhorseone/mcp-server-uk-parliament-lordsvotes',
    version: '0.1.0',
  });

  registerAllTools(server);
  return server;
}

async function main(): Promise<void> {
  const server = createStdioServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`UK Parliament Lords Votes MCP server running on stdio with ${TOOL_COUNT} tools`);
}

main().catch((error) => {
  console.error('Fatal error in stdio server:', error);
  process.exit(1);
});
