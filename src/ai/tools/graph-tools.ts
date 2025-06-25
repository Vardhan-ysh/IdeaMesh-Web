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
    outputSchema: z.string(),
  },
  async () => {
    // This tool's logic is handled on the client-side.
    // The model generates the call, the client executes it.
    // We return a string to satisfy the tool-calling loop.
    return "Action to add node has been requested.";
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
    outputSchema: z.string(),
  },
  async () => {
    // Client-side logic
    return "Action to update node has been requested.";
  }
);

export const deleteNodeTool = ai.defineTool(
  {
    name: 'deleteNode',
    description: 'Deletes a node from the graph. Use this when the user wants to remove a concept or idea.',
    inputSchema: z.object({
      nodeId: z.string().describe('The ID of the node to delete.'),
    }),
    outputSchema: z.string(),
  },
  async () => {
    // Client-side logic
    return "Action to delete node has been requested.";
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
    outputSchema: z.string(),
  },
  async () => {
    // Client-side logic
    return "Action to add edge has been requested.";
  }
);

export const updateEdgeTool = ai.defineTool(
  {
    name: 'updateEdge',
    description: 'Updates the label of an existing edge (link) between two nodes. Find the edge ID from the provided graph data.',
    inputSchema: z.object({
      edgeId: z.string().describe('The ID of the edge to update.'),
      newLabel: z.string().describe('The new label for the edge.'),
    }),
    outputSchema: z.string(),
  },
  async () => {
    // Client-side logic
    return "Action to update edge has been requested.";
  }
);

export const deleteEdgeTool = ai.defineTool(
  {
    name: 'deleteEdge',
    description: 'Deletes an existing edge (link) between two nodes. Find the edge ID from the provided graph data.',
    inputSchema: z.object({
      edgeId: z.string().describe('The ID of the edge to delete.'),
    }),
    outputSchema: z.string(),
  },
  async () => {
    // Client-side logic
    return "Action to delete edge has been requested.";
  }
);
