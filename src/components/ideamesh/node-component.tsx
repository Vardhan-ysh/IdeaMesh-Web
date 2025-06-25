
'use client';

import type { Node } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Link2 } from 'lucide-react';
import Image from 'next/image';

interface NodeComponentProps {
  node: Node;
  isSelected: boolean;
  isConnectionSource: boolean;
  isDimmed: boolean;
  isHighlighted: boolean;
  onClick: (event: React.MouseEvent) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onStartConnect: (event: React.MouseEvent) => void;
}

export default function NodeComponent({
  node,
  isSelected,
  isConnectionSource,
  isDimmed,
  isHighlighted,
  onClick,
  onMouseDown,
  onMouseUp,
  onStartConnect,
}: NodeComponentProps) {
  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'absolute group cursor-pointer transition-all duration-300 flex flex-col items-center justify-center p-4 text-center text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 select-none',
        shapeClasses[node.shape],
        {
          'ring-4 ring-offset-2 ring-accent': isSelected || isConnectionSource,
          'opacity-30': isDimmed,
          'scale-110 ring-4 ring-green-400': isHighlighted
        }
      )}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: '180px',
        height: '120px',
        backgroundColor: node.color,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {node.imageUrl && (
        <Image
          src={node.imageUrl}
          alt={node.title}
          width={40}
          height={40}
          className="rounded-md mb-1 object-cover"
          data-ai-hint="idea visual"
        />
      )}
      <h3 className="font-bold text-sm truncate w-full">{node.title}</h3>
      <p className="text-xs text-primary-foreground/80 line-clamp-2 w-full px-2">{node.content}</p>
      
      <button 
        onMouseDown={onStartConnect}
        className="absolute -top-2 -right-2 bg-card text-card-foreground p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
        aria-label="Create connection"
      >
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}
