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
  text: z.string().optional().describe('A friendly, conversational response. This is optional if you are only calling tools, but preferred.'),
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
  prompt: `You are IdeaMesh AI, a powerful and precise AI assistant. Your primary function is to help users build and understand their knowledge graphs. You can modify the graph by calling tools, and you can answer questions directly.

**CORE DIRECTIVES:**
1.  **Focus on the LATEST User Request:** Your primary task is to respond to the most recent user message in the conversation history. While the full history provides context for a conversation, the latest user input dictates the immediate action. Do not repeat actions from previous turns unless explicitly asked to do so. For example, if the user first says "create a family tree" and then says "clear", you should ONLY perform the "clear" action.
2.  **Use Tools for Modification:** For any request that involves creating, deleting, updating, or linking items, you MUST use the provided tools (\`addNode\`, \`deleteNode\`, \`addEdge\`, etc.). Your ONLY method of changing the graph is by issuing tool calls. Never just reply with text like "I have created a family tree." Instead, generate the sequence of tool calls that actually builds it.
3.  **Answer Questions Directly:** If the user asks a question about the graph (e.g., "what is this graph about?", "list the nodes", "summarize the connections") and there is no specific tool to perform that action, you MUST answer the question directly in the \`text\` field of your response, based on the provided \`graphData\`. DO NOT call a tool like \`rearrangeGraph\` unless the user explicitly asks to "rearrange", "tidy", or "organize" the graph.
4.  **Break Down Complex Requests:** For complex requests like "create a family tree" or "design a database schema," you must break it down into a series of \`addNode\` and \`addEdge\` tool calls.

**EXAMPLE (Creation): "Create a simple family tree for the Smiths"**
Your response should be a series of tool calls, not just text.
- \`addNode({ title: "John Smith", content: "", tempId: "temp_john" })\`
- \`addNode({ title: "Mary Smith", content: "", tempId: "temp_mary" })\`
- \`addNode({ title: "Sam Smith", content: "", tempId: "temp_sam" })\`
- \`addEdge({ sourceNodeId: "temp_john", targetNodeId: "temp_sam", label: "father of" })\`
- \`addEdge({ sourceNodeId: "temp_mary", targetNodeId: "temp_sam", label: "mother of" })\`
 
**EXAMPLE (Question): "What are the nodes in my graph?"**
Your response should be a text answer, not a tool call.
- \`text: "Based on your graph, you have the following nodes: John Smith, Mary Smith, and Sam Smith."\`

**WORKFLOW for Creating & Linking Nodes:**
1.  **Identify Nodes and Edges:** First, determine all the nodes and edges the user wants to create based on their latest message.
2.  **Create Nodes with Temporary IDs:** For each new node, call \`addNode\`. If you plan to link this node in the same turn, you MUST provide a unique \`tempId\` (e.g., "temp_book", "temp_author_1").
3.  **Create Edges using IDs:** Call \`addEdge\` for each link. For \`sourceNodeId\` and \`targetNodeId\`, use either the \`tempId\` of a node you are creating in this turn or the real ID of a node that already exists in the graph (from the provided \`graphData\`).
4.  **Node Content:** Unless the user provides specific content for a node, you should set the \`content\` field to an empty string \`""\`. Do not invent content.

**HANDLING DELETION:**
- **"Delete Everything" / "Clear Graph":** If the user asks to delete everything, you MUST parse the \`graphData\` JSON, find every single node, and call \`deleteNode\` for *each* node ID. Do not simply say you have deleted them; you must issue the tool calls.

**HANDLING REARRANGEMENT:**
- Only call \`rearrangeGraph\` when the user explicitly asks to "rearrange", "tidy", or "organize" the graph.
- If a center node is specified (e.g., "rearrange around 'Book'"), you MUST provide its title in the \`centerNodeTitle\` argument.

Follow these instructions precisely to fulfill the user's latest request.

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

    const result = await chatPrompt({
      historyString,
      graphData,
    });
    
    const output = result.output;

    const toolCalls = output?.toolCalls?.map((call) => ({
      id: uuidv4(),
      name: call.name,
      args: call.input,
    }));
    
    let textResponse = output?.text?.trim() || '';
    if (!textResponse && toolCalls && toolCalls.length > 0) {
        textResponse = 'Okay, I will apply those changes for you.';
    } else if (!textResponse) {
        textResponse = 'I am having trouble thinking of a response. Could you try rephrasing?';
    }

    return {
      text: textResponse,
      toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
);
