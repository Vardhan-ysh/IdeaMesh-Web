'use server';

/**
 * @fileOverview Smart search flow that provides suggestions based on the context of the idea graph.
 *
 * - smartSearch - A function that handles the smart search process.
 * - SmartSearchInput - The input type for the smartSearch function.
 * - SmartSearchOutput - The return type for the smartSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSearchInputSchema = z.object({
  searchTerm: z.string().describe('The search term provided by the user.'),
  graphContext: z.string().describe('The context of the idea graph, including node titles and relationships.'),
});
export type SmartSearchInput = z.infer<typeof SmartSearchInputSchema>;

const SmartSearchOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested nodes based on the search term and graph context.'),
});
export type SmartSearchOutput = z.infer<typeof SmartSearchOutputSchema>;

export async function smartSearch(input: SmartSearchInput): Promise<SmartSearchOutput> {
  return smartSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSearchPrompt',
  input: {schema: SmartSearchInputSchema},
  output: {schema: SmartSearchOutputSchema},
  prompt: `You are an AI assistant that provides smart search suggestions for an idea graph.

The user is searching for nodes related to the following search term: {{{searchTerm}}}

Considering the context of the idea graph below, suggest a list of related nodes that the user might be interested in. Return only the node titles.

Graph Context: {{{graphContext}}}

Suggestions (as an array of strings):`,
});

const smartSearchFlow = ai.defineFlow(
  {
    name: 'smartSearchFlow',
    inputSchema: SmartSearchInputSchema,
    outputSchema: SmartSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
