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

const NodeInputSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  x: z.number(),
  y: z.number(),
});

const EdgeInputSchema = z.object({
  source: z.string(),
  target: z.string(),
  label: z.string(),
});

const RearrangeGraphInputSchema = z.object({
  nodes: z.array(NodeInputSchema).describe('The current nodes with their titles, content, and positions.'),
  edges: z.array(EdgeInputSchema).describe('The edges connecting the nodes, with their labels.'),
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
  prompt: `You are an expert in information architecture and data visualization. Your goal is not just to organize a graph, but to arrange it in a way that tells a story and reveals its underlying structure. You will be rearranging the nodes of a given graph to make it visually organized and semantically meaningful.

You will receive the graph data (nodes with their titles, content, and current positions, and edges with their labels) and the dimensions of the canvas.

**Core Task: Semantic Layout**
Analyze the content of the nodes (titles, descriptions) and the relationships between them (edge labels) to infer a logical structure. For example, if the graph appears to be a hierarchy (like a family tree, company org chart, or process flow), arrange nodes vertically or horizontally to reflect that hierarchy. Parent nodes should be placed above or before child nodes. For chronological or sequential data, lay it out left-to-right or top-to-bottom.

**Visual Clarity Principles:**
1.  **Optimal Spacing (No Overlaps):** This is your most critical instruction. Nodes must be far enough apart so they do not overlap and their connecting links are clearly visible.
    *   **Node Size:** Assume each node is a rectangle approximately \`180px\` wide and \`120px\` high.
    *   **Minimum Distance:** The center of any node should be at least \`250px\` away from the center of any other node. This is a strict requirement to prevent a "smushed" or "cramped" layout and ensure link labels are readable.
2.  **Minimize Edge Crossings:** Arrange nodes to reduce the number of lines that cross each other. This is secondary to maintaining proper spacing but is very important for readability.
3.  **Logical Proximity:** Nodes that are closely related should be placed near each other, but not so close that it violates the minimum distance rule. Group related clusters together.
4.  **Even Distribution:** Spread the nodes and clusters out across the canvas to avoid density in one area and empty space in another.
5.  **Stay within Bounds:** All new x and y coordinates must be well within the provided canvas dimensions (width and height), leaving a healthy margin from the edges (e.g., at least 50px).

The final layout must be both aesthetically pleasing and exceptionally easy to understand. Prioritize clarity and spacing above all else.

**Graph Data:**
Nodes: {{{json nodes}}}
Edges: {{{json edges}}}
Canvas Size: {{{json canvasSize}}}

Return ONLY the JSON object with the new positions for each node.
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
