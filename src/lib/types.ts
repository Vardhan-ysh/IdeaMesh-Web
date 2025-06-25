export interface Node {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  color: string;
  shape: 'circle' | 'square';
  tags: string[];
  imageUrl?: string;
}

export interface Edge {
  id:string;
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export type SuggestedLink = {
  id: string;
  source: string;
  target: string;
  reason: string;
};

export interface GraphMetadata {
  id: string;
  name: string;
  ownerId: string;
  createdAt: any;
  lastEdited: any;
  isPublic: boolean;
  nodeCount?: number;
}

// New types for chat
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  isHandled?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  walkthroughCompleted?: boolean;
}
