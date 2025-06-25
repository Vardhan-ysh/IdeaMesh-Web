'use client';

import type { Node, Edge } from '@/lib/types';
import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';
import React from 'react';

interface EdgeComponentProps {
  edge: Edge;
  nodes: Node[];
  isDimmed: boolean;
  isSuggestion?: boolean;
  onConfirm?: () => void;
  onDismiss?: () => void;
}

export default function EdgeComponent({
  edge,
  nodes,
  isDimmed,
  isSuggestion = false,
  onConfirm,
  onDismiss,
}: EdgeComponentProps) {
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  if (!sourceNode || !targetNode) {
    return null;
  }
  
  const midX = (sourceNode.x + targetNode.x) / 2;
  const midY = (sourceNode.y + targetNode.y) / 2;
  
  const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x) * (180 / Math.PI);

  const buttonMidX = midX - 45; // Adjust for button group width
  const buttonMidY = midY - 16; // Adjust for button height

  return (
    <g className={`transition-opacity duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}>
      <line
        x1={sourceNode.x}
        y1={sourceNode.y}
        x2={targetNode.x}
        y2={targetNode.y}
        stroke={isSuggestion ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))'}
        strokeWidth="2"
        strokeDasharray={isSuggestion ? "5,5" : "none"}
        markerEnd="url(#arrow)"
      />
      <foreignObject x={midX - 75} y={midY - 15} width="150" height="30">
        <div 
          xmlns="http://www.w3.org/1999/xhtml"
          className="text-xs bg-background/80 px-2 py-0.5 rounded-md text-muted-foreground text-center"
        >
          {edge.label}
        </div>
      </foreignObject>
       {isSuggestion && (
        <foreignObject x={buttonMidX} y={buttonMidY} width="90" height="32">
          <div xmlns="http://www.w3.org/1999/xhtml" className="flex gap-1 bg-background/80 p-1 rounded-md">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500" onClick={onConfirm}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </foreignObject>
      )}
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={isSuggestion ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))'} />
        </marker>
      </defs>
    </g>
  );
}
