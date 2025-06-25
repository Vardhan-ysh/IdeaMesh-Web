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
    isHandled: z.boolean().optional(),
  })).describe('An array of tool calls suggested by the AI to modify the graph.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


const chatPrompt = ai.definePrompt({
    name: 'chatWithGraphPrompt',
    tools: [addNodeTool, updateNodeTool, addEdgeTool],
    toolChoice: 'auto',
    prompt: `You are IdeaMesh AI, a friendly and helpful AI assistant integrated into a knowledge graph application. Your purpose is to help users build, understand, and interact with their idea graphs through conversation. You can also engage in general conversation.

You have access to the user's current graph data (nodes and their IDs, and edges). You also have a set of tools to modify this graph.

Your capabilities:
- Engage in friendly, general conversation. If the user says "hi", say "hi" back.
- Answer questions about the concepts in the graph based on the provided data.
- When a user asks to create a new idea, use the 'addNode' tool. For example, if the user says "create a node about dogs", call addNode with title: "dogs".
- When a user wants to change an existing idea, use the 'updateNode' tool. You MUST use the correct nodeId from the provided graph data.
- When a user wants to connect two ideas, use the 'addEdge' tool. You MUST use the correct nodeIds from the provided graph data.
- For any action you take (calling a tool), you MUST also provide a clear, concise, and friendly text response explaining what you are doing or asking for more information. For example, "Okay, I've created a node for 'dogs'. What should the content be?"

Current Graph Data:
{{{graphData}}}

---

User Request: {{{prompt}}}
`,
    input: {
      schema: z.object({
        graphData: z.string(),
        prompt: z.string(),
      })
    }
});

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
    
    if (!history || history.length === 0) {
        return { text: "Please start the conversation.", toolCalls: [] };
    }
    
    // Map all but the last message to the format Genkit expects for history.
    const modelHistory = history.slice(0, -1).map(item => ({
      role: item.role,
      content: [{ text: item.text }],
    }));

    const lastUserMessage = history[history.length - 1];

    const { output } = await chatPrompt({
        history: modelHistory,
        input: {
            graphData: graphData,
            prompt: lastUserMessage.text,
        }
    });

    const toolCalls = output?.toolCalls?.map(call => ({
        id: uuidv4(),
        name: call.name,
        args: call.input,
        isHandled: false,
    })) || [];

    return {
      text: output?.text || 'I am not sure how to respond to that. Could you please rephrase?',
      toolCalls,
    };
  }
);
