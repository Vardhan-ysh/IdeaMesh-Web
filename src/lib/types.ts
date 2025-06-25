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