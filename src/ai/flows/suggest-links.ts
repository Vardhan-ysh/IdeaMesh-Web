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
  prompt: `You are an AI assistant helping a user discover connections between ideas in their idea graph.

  Given the following nodes and existing links, suggest potential new links between nodes that the user might find helpful.
  Explain the reasoning behind each suggested link.

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

  Suggest potential links between nodes (that do not already exist) and explain the reasoning behind each suggestion.  Return a JSON array of objects, where each object has a source (node ID), a target (node ID) and a reason (why the link is suggested).
  Do not suggest a link if one already exists between those two nodes.
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
