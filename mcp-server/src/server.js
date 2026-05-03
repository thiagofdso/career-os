import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createApiClient, registerTools } from './index.js';

const API = process.env.BACKEND_URL || 'http://localhost:3001/api';
const server = new McpServer({ name: 'career-os-mcp', version: '0.3.0' });
registerTools(server, createApiClient(API));
await server.connect(new StdioServerTransport());
