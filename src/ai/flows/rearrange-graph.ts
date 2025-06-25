'use server';

/**
 * @fileOverview AI-driven graph layout optimization.
 *
 * - rearrangeGraph - A function that calculates an optimal layout for the graph nodes.
 * - RearrangeGraphInput - The input type for the rearrangeGraph function.
 * - RearrangeGraphOutput - The return type for the rearrangeGraph function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NodePositionSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
});

const RearrangeGraphInputSchema = z.object({
  nodes: z.array(NodePositionSchema).describe('The current nodes with their positions.'),
  edges: z.array(z.object({
    source: z.string(),
    target: z.string(),
  })).describe('The edges connecting the nodes.'),
  canvasSize: z.object({
    width: z.number(),
    height: z.number()
  }).describe('The dimensions of the canvas area to arrange the nodes within.')
});
export type RearrangeGraphInput = z.infer<typeof RearrangeGraphInputSchema>;

const RearrangeGraphOutputSchema = z.object({
  positions: z.array(z.object({
    nodeId: z.string().describe('The ID of the node to update.'),
    x: z.number().describe('The new x-coordinate for the node.'),
    y: z.number().describe('The new y-coordinate for the node.'),
  })).describe('An array of nodes with their new calculated positions.'),
});
export type RearrangeGraphOutput = z.infer<typeof RearrangeGraphOutputSchema>;

export async function rearrangeGraph(input: RearrangeGraphInput): Promise<RearrangeGraphOutput> {
  return rearrangeGraphFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rearrangeGraphPrompt',
  input: {schema: RearrangeGraphInputSchema},
  output: {schema: RearrangeGraphOutputSchema},
  prompt: `You are an expert in graph visualization and layout algorithms. Your task is to rearrange the nodes of a given graph to make it visually organized and easy to understand.

You will receive the graph data (nodes with their current positions, and edges) and the dimensions of the canvas.

**Layout Principles:**
1.  **Minimize Edge Crossings:** Arrange nodes to reduce the number of lines that cross each other.
2.  **Proximity of Connected Nodes:** Nodes that are connected by an edge should be placed relatively close to each other.
3.  **Even Distribution:** Spread the nodes out across the canvas to avoid clustering in one area.
4.  **No Overlaps:** Ensure nodes do not overlap. Assume each node is a rectangle of about 180x120 pixels. Maintain a safe distance between nodes.
5.  **Stay within Bounds:** All new x and y coordinates must be within the provided canvas dimensions (width and height).

Analyze the provided nodes and edges, then calculate and return the new optimal (x, y) coordinates for each node.

**Graph Data:**
Nodes: {{{json nodes}}}
Edges: {{{json edges}}}
Canvas Size: {{{json canvasSize}}}

Return ONLY the JSON object with the new positions.
`,
});


const rearrangeGraphFlow = ai.defineFlow(
  {
    name: 'rearrangeGraphFlow',
    inputSchema: RearrangeGraphInputSchema,
    outputSchema: RearrangeGraphOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
