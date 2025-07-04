import { config } from 'dotenv';
config();

import '@/ai/flows/smart-search.ts';
import '@/ai/flows/suggest-links.ts';
import '@/ai/flows/graph-summarization.ts';
import '@/ai/flows/chat-flow.ts';
import '@/ai/flows/rearrange-graph.ts';
