'use client';

import type { Node, Edge } from '@/lib/types';
import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';

interface EdgeComponentProps {
  edge: Edge;
  nodes: Node[];
  edges: Edge[];
  isDimmed: boolean;
  isSuggestion?: boolean;
  onConfirm?: () => void;
  onDismiss?: () => void;
}

export default function EdgeComponent({
  edge,
  nodes,
  edges,
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
      const denom = Math.sqrt(b * b * dirX * dirX + a * a * dirY * dirY);
      return denom === 0 ? 0 : (a * b) / denom;
    } else { // square
      const abs_dx = Math.abs(dirX);
      const abs_dy = Math.abs(dirY);
      if (abs_dx < 1e-9 && abs_dy < 1e-9) return 0;
      if (abs_dx < 1e-9) return halfHeight / abs_dy;
      if (abs_dy < 1e-9) return halfWidth / abs_dx;
      return Math.min(halfWidth / abs_dx, halfHeight / abs_dy);
    }
  };

  const tSource = getIntersectionT(sourceNode, ux, uy);
  const tTarget = getIntersectionT(targetNode, -ux, -uy);

  if (distance < tSource + tTarget) {
    return null;
  }

  const startX = sx + ux * tSource;
  const startY = sy + uy * tSource;
  const endX = tx - ux * tTarget;
  const endY = ty - uy * tTarget;

  const hasReciprocal = !isSuggestion && edges.some(e => e.source === edge.target && e.target === edge.source);

  let pathData;
  let labelX, labelY;

  if (isSuggestion) {
      pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
      labelX = (startX + endX) / 2;
      labelY = (startY + endY) / 2;
  } else {
      const lineDx = endX - startX;
      const lineDy = endY - startY;

      const perpLength = Math.sqrt(lineDx * lineDx + lineDy * lineDy) || 1;
      const perpDx = -lineDy / perpLength;
      const perpDy = lineDx / perpLength;
      
      let curvature = 15;
      if (hasReciprocal) {
          curvature = edge.source > edge.target ? 35 : -35;
      }

      const controlX = (startX + endX) / 2 + perpDx * curvature;
      const controlY = (startY + endY) / 2 + perpDy * curvature;

      pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
      
      labelX = 0.25 * startX + 0.5 * controlX + 0.25 * endX;
      labelY = 0.25 * startY + 0.5 * controlY + 0.25 * endY;
  }

  return (
    <g className={`transition-opacity duration-300 ${isDimmed ? 'opacity-20' : 'opacity-100'}`}>
       <path
        d={pathData}
        fill="none"
        stroke={isSuggestion ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))'}
        strokeWidth="2"
        strokeDasharray={isSuggestion ? "5,5" : "none"}
        markerEnd={isSuggestion ? "url(#arrow-suggestion)" : "url(#arrow-default)"}
      />
      
      {isSuggestion ? (
        <foreignObject x={labelX - 75} y={labelY - 35} width="150" height="70" className="pointer-events-auto">
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
        <foreignObject x={labelX - 75} y={labelY - 15} width="150" height="30">
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
