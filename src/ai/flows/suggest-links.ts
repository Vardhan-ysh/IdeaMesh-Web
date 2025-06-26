'use server';

/**
 * @fileOverview Suggests potential links between nodes in an idea graph.
 *
 * - suggestLinks - A function that suggests links between nodes.
 * - SuggestLinksInput - The input type for the suggestLinks function.
 * - SuggestLinksOutput - The return type for the suggestLinks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLinksInputSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the node.'),
      title: z.string().describe('The title of the node.'),
      content: z.string().describe('The content of the node.'),
    })
  ).describe('An array of nodes in the idea graph.'),
  existingLinks: z.array(
    z.object({
      source: z.string().describe('The ID of the source node.'),
      target: z.string().describe('The ID of the target node.'),
      label: z.string().describe('The label of the link.'),
    })
  ).optional().describe('An array of existing links between nodes.'),
});

export type SuggestLinksInput = z.infer<typeof SuggestLinksInputSchema>;

const SuggestLinksOutputSchema = z.array(
  z.object({
    source: z.string().describe('The ID of the source node for the suggested link.'),
    target: z.string().describe('The ID of the target node for the suggested link.'),
    reason: z.string().describe('The reasoning behind the suggested link.'),
  })
).describe('An array of suggested links between nodes.');

export type SuggestLinksOutput = z.infer<typeof SuggestLinksOutputSchema>;

export async function suggestLinks(input: SuggestLinksInput): Promise<SuggestLinksOutput> {
  return suggestLinksFlow(input);
}

const suggestLinksPrompt = ai.definePrompt({
  name: 'suggestLinksPrompt',
  input: {schema: SuggestLinksInputSchema},
  output: {schema: SuggestLinksOutputSchema},
  prompt: `You are an AI assistant helping a user discover connections between ideas in their idea graph. Your goal is to identify meaningful, non-obvious relationships that could enrich the user's understanding.

Given the following nodes and existing links, suggest potential new links between nodes that the user might find helpful.

**Rules for Suggestions:**
1.  **High Relevance:** Only suggest links that represent a strong, clear connection between two nodes.
2.  **No Duplicates:** Do not suggest a link if a connection (in either direction) already exists between the two nodes.
3.  **One Link Per Pair:** Suggest at most one link between any given pair of nodes.
4.  **No Self-Links:** Do not suggest a link from a node to itself.
5.  **Quality over Quantity:** If you cannot find any strong, meaningful connections, return an empty array. It is better to suggest nothing than to suggest a weak or irrelevant link.

Explain the reasoning behind each suggested link clearly and concisely.

Nodes:
{{#each nodes}}
- ID: {{this.id}}
  Title: {{this.title}}
  Content: {{this.content}}
{{/each}}

Existing Links:
{{#if existingLinks}}
  {{#each existingLinks}}
  - Source: {{this.source}}, Target: {{this.target}}, Label: {{this.label}}
  {{/each}}
{{else}}
There are no existing links.
{{/if}}

Return a JSON array of objects, where each object has a "source" (node ID), a "target" (node ID), and a "reason" (why the link is suggested).
`,
});

const suggestLinksFlow = ai.defineFlow(
  {
    name: 'suggestLinksFlow',
    inputSchema: SuggestLinksInputSchema,
    outputSchema: SuggestLinksOutputSchema,
  },
  async input => {
    const {output} = await suggestLinksPrompt(input);
    return output!;
  }
);
