'use server';

/**
 * @fileOverview A context-aware AI chat for the idea graph with tool-calling capabilities.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { addNodeTool, updateNodeTool, addEdgeTool, deleteNodeTool, updateEdgeTool, deleteEdgeTool } from '@/ai/tools/graph-tools';
import { v4 as uuidv4 } from 'uuid';

const HistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(HistoryItemSchema).describe('The conversation history so far.'),
  graphData: z.string().describe('The current state of the graph in JSON format.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  text: z.string().describe('The conversational response from the AI.'),
  toolCalls: z.array(z.object({
    id: z.string(),
    name: z.string(),
    args: z.record(z.string(), z.any()),
  })).optional().describe('An array of tool calls suggested by the AI to modify the graph.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithGraph(input: ChatInput): Promise<ChatOutput> {
  return chatWithGraphFlow(input);
}

const promptOutputSchema = z.object({
  text: z.string(),
  toolCalls: z.array(z.object({
    name: z.string(),
    input: z.record(z.string(), z.any()),
  })).optional(),
});

const chatPrompt = ai.definePrompt({
  name: 'chatWithGraphPrompt',
  input: {
    schema: z.object({
      graphData: z.string(),
      historyString: z.string(),
    }),
  },
  output: { schema: promptOutputSchema },
  tools: [addNodeTool, updateNodeTool, addEdgeTool, deleteNodeTool, updateEdgeTool, deleteEdgeTool],
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are IdeaMesh AI, a friendly and helpful AI assistant integrated into a knowledge graph application. 
Your goal is to have a conversation with the user, answering their questions and discussing the ideas within their graph.
Use the provided graph data and conversation history to inform your responses.

You have the following capabilities to modify the graph:
- Creating nodes
- Updating nodes
- Deleting nodes
- Adding edges (links)
- Updating edges
- Deleting edges

If the user asks to perform one of these actions, use the available tools.
When updating or deleting an edge, you must find its 'id' from the graph data provided.

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
    
    const toolCalls = output?.toolCalls?.map((call) => ({
      id: uuidv4(),
      name: call.name,
      args: call.input,
    }));

    return {
      text:
        output?.text?.trim() ||
        'I am having trouble thinking of a response. Could you try rephrasing?',
      toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
);
