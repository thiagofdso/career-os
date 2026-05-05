import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/api/v1";

const server = new Server(
  {
    name: "career-os-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TABLES = ['vaga', 'networking', 'entrevista', 'conteudo', 'projeto', 'orquestrador'];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_tasks",
        description: "List tasks from a specific category",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: TABLES,
              description: "The category of tasks to list"
            }
          },
          required: ["category"]
        }
      },
      {
        name: "create_task",
        description: "Create a new task in a specific category",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", enum: TABLES },
            type: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            origin: { type: "string" },
            agentId: { type: "string" },
            status: { type: "string" },
            priority: { type: "string" },
            deadline: { type: "string" },
            score: { type: "number" },
            needsApproval: { type: "boolean" }
          },
          required: ["category", "title", "type", "agentId", "status", "priority"]
        }
      },
      {
        name: "update_task",
        description: "Update an existing task",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", enum: TABLES },
            id: { type: "number" },
            status: { type: "string" },
            needsApproval: { type: "boolean" },
            description: { type: "string" }
          },
          required: ["category", "id"]
        }
      },
      {
        name: "get_metrics",
        description: "Get overall career metrics",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_tasks": {
        const response = await axios.get(`${BACKEND_URL}/task-${args.category}`);
        return {
          content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
        };
      }
      case "create_task": {
        const { category, ...taskData } = args;
        const response = await axios.post(`${BACKEND_URL}/task-${category}`, taskData);
        return {
          content: [{ type: "text", text: `Task created: ${JSON.stringify(response.data, null, 2)}` }]
        };
      }
      case "update_task": {
        const { category, id, ...updateData } = args;
        const response = await axios.patch(`${BACKEND_URL}/task-${category}/${id}`, updateData);
        return {
          content: [{ type: "text", text: `Task updated: ${JSON.stringify(response.data, null, 2)}` }]
        };
      }
      case "get_metrics": {
        const response = await axios.get(`${BACKEND_URL.replace('/v1', '')}/metrics`);
        return {
          content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }]
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message }]
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CareerOS MCP server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error running MCP server:", error);
  process.exit(1);
});
