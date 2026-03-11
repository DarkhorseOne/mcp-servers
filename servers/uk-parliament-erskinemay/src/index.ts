import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerAllTools, TOOL_COUNT } from './tools.generated.js';

export function createStdioServer(): McpServer {
  const server = new McpServer({
    name: '@darkhorseone/mcp-server-uk-parliament-erskinemay',
    version: '1.0.0',
  });

  registerAllTools(server);
  return server;
}

async function main(): Promise<void> {
  const server = createStdioServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`@darkhorseone/mcp-server-uk-parliament-erskinemay running on stdio with ${TOOL_COUNT} tools`);
}

main().catch((error) => {
  console.error('Fatal error in stdio server:', error);
  process.exit(1);
});
