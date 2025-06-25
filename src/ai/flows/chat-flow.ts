'use server';

/**
 * @fileOverview A context-aware AI chat for the idea graph with tool-calling capabilities.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { addNodeTool, updateNodeTool, addEdgeTool, deleteNodeTool, updateEdgeTool, deleteEdgeTool, rearrangeGraphTool } from '@/ai/tools/graph-tools';
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
  tools: [addNodeTool, updateNodeTool, addEdgeTool, deleteNodeTool, updateEdgeTool, deleteEdgeTool, rearrangeGraphTool],
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are IdeaMesh AI, a powerful AI assistant that can modify the user's knowledge graph.

Your primary capability is to perform multiple graph modifications in a single turn by calling tools. For complex requests like "create a library management system," you must break it down into a sequence of tool calls.

**CRITICAL WORKFLOW for creating and linking nodes simultaneously:**
1.  **Identify Nodes and Edges:** First, figure out all the nodes and edges the user wants to create.
2.  **Create Nodes with Temporary IDs:** For each new node you need to create, call the 'addNode' tool. If you plan to link this node in the same turn, you MUST provide a unique 'tempId' (e.g., "temp_book", "temp_author_1").
3.  **Create Edges using IDs:** Call the 'addEdge' tool for each link. For the 'sourceNodeId' and 'targetNodeId', you can use:
    - The 'tempId' of a node you are creating in this turn.
    - The real ID of a node that already exists in the graph (look it up in the provided 'graphData').

**HANDLING DELETION:**
- **Single Node/Edge:** If the user asks to delete a specific node or edge, use the 'deleteNode' or 'deleteEdge' tool with the correct ID from the 'graphData'.
- **"Delete Everything" / "Clear Graph":** If the user makes a request to delete everything, you MUST parse the 'graphData' JSON, find every single node, and call the 'deleteNode' tool for each node ID. Do not simply say you have deleted them; you must issue the tool calls.

**HANDLING REARRANGEMENT:**
- If the user asks to "rearrange", "tidy", or "organize" the graph, call the 'rearrangeGraph' tool.
- If the user specifies a node to be the center (e.g., "rearrange the graph to make 'Book' the center"), you MUST provide the title of that node in the 'centerNodeTitle' argument of the 'rearrangeGraph' tool.

By following this workflow, you can create and modify entire interconnected structures in one response.

Here is the current state of the graph. Use it to find IDs of existing nodes:
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
