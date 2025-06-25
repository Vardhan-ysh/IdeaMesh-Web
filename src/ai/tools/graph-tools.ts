'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const addNodeTool = ai.defineTool(
  {
    name: 'addNode',
    description: 'Adds a new node to the graph. Use this when the user wants to create a new concept or idea.',
    inputSchema: z.object({
      title: z.string().describe('The title of the new node.'),
      content: z.string().describe('The content or description for the new node.'),
    }),
    outputSchema: z.void(),
  },
  async () => {
    // This tool's logic is handled on the client-side.
    // The model generates the call, the client executes it.
  }
);

export const updateNodeTool = ai.defineTool(
  {
    name: 'updateNode',
    description: 'Updates an existing node in the graph. Use this to change the title or content of a node.',
    inputSchema: z.object({
      nodeId: z.string().describe('The ID of the node to update.'),
      title: z.string().optional().describe('The new title for the node.'),
      content: z.string().optional().describe('The new content for the node.'),
    }),
    outputSchema: z.void(),
  },
  async () => {
    // Client-side logic
  }
);

export const addEdgeTool = ai.defineTool(
  {
    name: 'addEdge',
    description: 'Adds a new edge (link) between two existing nodes in the graph. Use this to connect two ideas.',
    inputSchema: z.object({
      sourceNodeId: z.string().describe('The ID of the source node.'),
      targetNodeId: z.string().describe('The ID of the target node.'),
      label: z.string().describe('A label describing the relationship between the nodes.'),
    }),
    outputSchema: z.void(),
  },
  async () => {
    // Client-side logic
  }
);
