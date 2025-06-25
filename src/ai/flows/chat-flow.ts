'use server';

/**
 * @fileOverview AI-driven chat that can interact with and modify the idea graph.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {addNodeTool, updateNodeTool, addEdgeTool} from '@/ai/tools/graph-tools';
import { v4 as uuidv4 } from 'uuid';

const HistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(HistoryItemSchema).describe('The conversation history so far.'),
  graphData: z.string().describe('The current state of the graph in JSON format, including nodes and their IDs. The AI should use the node IDs from this data when suggesting modifications.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  text: z.string().describe('The conversational response from the AI.'),
  toolCalls: z.array(z.object({
    id: z.string(),
    name: z.string(),
    args: z.record(z.string(), z.any()),
  })).describe('An array of tool calls suggested by the AI to modify the graph.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithGraph(input: ChatInput): Promise<ChatOutput> {
  return chatWithGraphFlow(input);
}

const chatWithGraphFlow = ai.defineFlow(
  {
    name: 'chatWithGraphFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history, graphData }) => {
    const modelHistory = history.map(item => ({
      role: item.role,
      content: [{ text: item.text }],
    }));

    const lastUserMessage = modelHistory.pop();
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      // We need at least one user message to start.
      return { text: "I can't start a conversation without a message from you.", toolCalls: [] };
    }
    
    const systemPrompt = `You are IdeaMesh AI, an expert assistant integrated into a knowledge graph application. Your purpose is to help users build, understand, and interact with their idea graphs through conversation.

You have access to the user's current graph data (nodes and their IDs, and edges). You also have a set of tools to modify this graph.

Your capabilities:
- Answer questions about the concepts in the graph.
- When a user asks to create a new idea, use the 'addNode' tool.
- When a user wants to change an existing idea, use the 'updateNode' tool. You MUST use the correct nodeId from the provided graph data.
- When a user wants to connect two ideas, use the 'addEdge' tool. You MUST use the correct nodeIds from the provided graph data.
- For any action you take or suggest, provide a clear, concise, and friendly text response explaining what you are doing.

Current Graph Data:
${graphData}
`;

    const { output } = await ai.generate({
      // The 'system' parameter is not supported by all models.
      // Instead, we are including the system instructions at the start of the prompt.
      history: modelHistory,
      prompt: `${systemPrompt}\n\n${lastUserMessage.content[0].text}`,
      tools: [addNodeTool, updateNodeTool, addEdgeTool],
      toolChoice: 'auto',
    });

    const toolCalls = output?.toolCalls?.map(call => ({
        id: uuidv4(),
        name: call.name,
        args: call.input,
    })) || [];

    return {
      text: output?.text || 'I am not sure how to respond to that.',
      toolCalls,
    };
  }
);
