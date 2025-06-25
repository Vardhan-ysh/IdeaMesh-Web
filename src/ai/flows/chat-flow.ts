'use server';

/**
 * @fileOverview A simplified, context-aware AI chat for the idea graph.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema remains the same, accepting history and graph data.
const HistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(HistoryItemSchema).describe('The conversation history so far.'),
  graphData: z.string().describe('The current state of the graph in JSON format.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// Output schema is simplified to only return text.
const ChatOutputSchema = z.object({
  text: z.string().describe('The conversational response from the AI.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// The exported function signature changes.
export async function chatWithGraph(input: ChatInput): Promise<ChatOutput> {
  return chatWithGraphFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatWithGraphPrompt',
  input: {
    schema: z.object({
      graphData: z.string(),
      historyString: z.string(),
    }),
  },
  output: { schema: ChatOutputSchema },
  model: 'googleai/gemini-1.5-flash-latest',

  // The prompt is simplified to focus on conversation and context awareness.
  prompt: `You are IdeaMesh AI, a friendly and helpful AI assistant for a knowledge graph application. 
Your goal is to have a conversation with the user, answering their questions and discussing the ideas within their graph.
Use the provided graph data and conversation history to inform your responses.

Here is the current state of the graph:
{{{graphData}}}

---
Here is the conversation history:
{{{historyString}}}
AI:`,
});

const chatWithGraphFlow = ai.defineFlow(
  {
    name: 'chatWithGraphFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({history, graphData}) => {
    if (!history || history.length === 0) {
      return {text: 'Hello! How can I help you with your graph today?'};
    }

    const historyString = history
      .map((message) => {
        const role = message.role === 'user' ? 'User' : 'AI';
        return `${role}: ${message.text}`;
      })
      .join('\n');

    const {output} = await chatPrompt({
      historyString,
      graphData,
    });

    // The return value is simplified. No more tool calls.
    return {
      text:
        output?.text?.trim() ||
        'I am having trouble thinking of a response. Could you try rephrasing?',
    };
  }
);
