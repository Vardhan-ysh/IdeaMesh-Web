'use server';

/**
 * @fileOverview AI-driven summarization of complex idea graphs.
 *
 * - summarizeGraph - A function that summarizes the idea graph.
 * - SummarizeGraphInput - The input type for the summarizeGraph function.
 * - SummarizeGraphOutput - The return type for the summarizeGraph function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeGraphInputSchema = z.object({
  graphData: z
    .string()
    .describe('The graph data in JSON format, containing nodes and edges.'),
});
export type SummarizeGraphInput = z.infer<typeof SummarizeGraphInputSchema>;

const SummarizeGraphOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the core ideas and insights in the graph.'),
});
export type SummarizeGraphOutput = z.infer<typeof SummarizeGraphOutputSchema>;

export async function summarizeGraph(input: SummarizeGraphInput): Promise<SummarizeGraphOutput> {
  return summarizeGraphFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeGraphPrompt',
  input: {schema: SummarizeGraphInputSchema},
  output: {schema: SummarizeGraphOutputSchema},
  prompt: `You are an expert in distilling complex information into concise summaries.

You will receive graph data in JSON format representing an idea graph. Your task is to analyze the graph and provide a summary that captures the core ideas and key insights.

Here's the graph data:
{{{graphData}}}

Focus on identifying the main themes, important connections, and significant conclusions within the graph. The summary should be easily understandable to someone unfamiliar with the detailed graph structure.
`,
});

const summarizeGraphFlow = ai.defineFlow(
  {
    name: 'summarizeGraphFlow',
    inputSchema: SummarizeGraphInputSchema,
    outputSchema: SummarizeGraphOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
