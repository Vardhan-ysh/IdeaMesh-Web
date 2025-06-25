'use client';

import type { Node, Edge } from '@/lib/types';
import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';

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
  
  const nodeWidth = 180;
  const nodeHeight = 120;
  const arrowHeadLength = 6;

  const sx = sourceNode.x;
  const sy = sourceNode.y;
  const tx = targetNode.x;
  const ty = targetNode.y;

  const dx = tx - sx;
  const dy = ty - sy;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return null;
  }
  
  const ux = dx / distance;
  const uy = dy / distance;

  const getIntersectionT = (node: Node, dirX: number, dirY: number) => {
    const halfWidth = nodeWidth / 2;
    const halfHeight = nodeHeight / 2;

    if (node.shape === 'circle') {
      const a = halfWidth;
      const b = halfHeight;
      return (a * b) / Math.sqrt(b * b * dirX * dirX + a * a * dirY * dirY);
    } else { // square
      const abs_dx = Math.abs(dirX);
      const abs_dy = Math.abs(dirY);
      if (abs_dx < 1e-9) return halfHeight / abs_dy;
      if (abs_dy < 1e-9) return halfWidth / abs_dx;
      return Math.min(halfWidth / abs_dx, halfHeight / abs_dy);
    }
  };

  const tSource = getIntersectionT(sourceNode, ux, uy);
  const tTarget = getIntersectionT(targetNode, -ux, -uy);

  // Don't draw the line if nodes are overlapping or too close
  if (distance < tSource + tTarget + arrowHeadLength) {
    return null;
  }

  const startX = sx + ux * tSource;
  const startY = sy + uy * tSource;
  const endX = tx - ux * (tTarget + arrowHeadLength);
  const endY = ty - uy * (tTarget + arrowHeadLength);

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <g className={`transition-opacity duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={isSuggestion ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))'}
        strokeWidth="2"
        strokeDasharray={isSuggestion ? "5,5" : "none"}
        markerEnd={isSuggestion ? "url(#arrow-suggestion)" : "url(#arrow-default)"}
      />
      
      {isSuggestion ? (
        <foreignObject x={midX - 75} y={midY - 35} width="150" height="70" className="pointer-events-auto">
           <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col items-center justify-center gap-1 h-full">
             <div className="flex gap-1 bg-background/80 p-1 rounded-md">
               <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500" onClick={onConfirm}>
                 <Check className="h-4 w-4" />
               </Button>
               <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={onDismiss}>
                 <X className="h-4 w-4" />
               </Button>
             </div>
             <div 
               className="text-xs bg-background/80 px-2 py-0.5 rounded-md text-muted-foreground text-center max-w-full truncate"
             >
               {edge.label}
             </div>
           </div>
         </foreignObject>
      ) : (
        <foreignObject x={midX - 75} y={midY - 15} width="150" height="30">
          <div 
            xmlns="http://www.w3.org/1999/xhtml"
            className="text-xs bg-background/80 px-2 py-0.5 rounded-md text-muted-foreground text-center"
          >
            {edge.label}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
