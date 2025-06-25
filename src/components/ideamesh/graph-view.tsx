'use client';

import { useState, useRef, useCallback } from 'react';
import type { Node, Edge, SuggestedLink } from '@/lib/types';
import NodeComponent from './node-component';
import EdgeComponent from './edge-component';
import { Button } from '@/components/ui/button';

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string | null) => void;
  onNodeDrag: (node: Node) => void;
  connectingNodeId: string | null;
  setConnectingNodeId: (nodeId: string | null) => void;
  suggestedLinks: SuggestedLink[];
  onConfirmSuggestion: (link: SuggestedLink) => void;
  onDismissSuggestion: (link: SuggestedLink) => void;
  highlightedNodes: Set<string>;
}

export default function GraphView({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
  onNodeDrag,
  connectingNodeId,
  setConnectingNodeId,
  suggestedLinks,
  onConfirmSuggestion,
  onDismissSuggestion,
  highlightedNodes,
}: GraphViewProps) {
  const [draggingNode, setDraggingNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (graphRef.current) {
      const zoomSensitivity = 0.1;
      const { deltaY } = e;
      const scaleChange = 1 - deltaY * zoomSensitivity * 0.1;
      const newScale = transform.scale * scaleChange;
      const clampedScale = Math.max(0.2, Math.min(3, newScale));

      const rect = graphRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - (mouseX - transform.x) * (clampedScale / transform.scale);
      const newY = mouseY - (mouseY - transform.y) * (clampedScale / transform.scale);
      
      setTransform({ scale: clampedScale, x: newX, y: newY });
    }
  }, [transform]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // This allows panning only when clicking on the background
    setIsPanning(true);
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
        const dx = e.clientX - lastMousePosition.current.x;
        const dy = e.clientY - lastMousePosition.current.y;
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        lastMousePosition.current = { x: e.clientX, y: e.clientY };
    } else if (draggingNode && graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale - draggingNode.offsetX;
      const y = (e.clientY - rect.top - transform.y) / transform.scale - draggingNode.offsetY;
      
      const draggedNode = nodes.find(n => n.id === draggingNode.id);
      if(draggedNode) {
        onNodeDrag({ ...draggedNode, x, y });
      }
    }
  }, [draggingNode, onNodeDrag, nodes, transform, isPanning]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
  }, []);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node && graphRef.current) {
        const rect = graphRef.current.getBoundingClientRect();
        const mouseInWorldX = (e.clientX - rect.left - transform.x) / transform.scale;
        const mouseInWorldY = (e.clientY - rect.top - transform.y) / transform.scale;
        
        const offsetX = mouseInWorldX - node.x;
        const offsetY = mouseInWorldY - node.y;

        setDraggingNode({ id: nodeId, offsetX, offsetY });
    }
  };

  const isFocusMode = selectedNodeId !== null;
  const isDimmed = (nodeId: string, edge?: Edge) => {
    if (!isFocusMode) return false;
    if (highlightedNodes.size > 0) return !highlightedNodes.has(nodeId);
    if(nodeId === selectedNodeId) return false;
    if(edge) {
      return edge.source !== selectedNodeId && edge.target !== selectedNodeId;
    }
    const isConnected = edges.some(e => 
        (e.source === selectedNodeId && e.target === nodeId) ||
        (e.target === selectedNodeId && e.source === nodeId)
    );
    return !isConnected;
  };

  return (
    <div
      ref={graphRef}
      className="relative w-full h-full bg-background overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={(e) => { 
          if(e.target === e.currentTarget) {
              onNodeClick(null); 
              setConnectingNodeId(null); 
          }
      }}
      onWheel={handleWheel}
    >
      <div 
        className="absolute top-0 left-0"
        style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
        }}
      >
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          {edges.map((edge) => (
            <EdgeComponent
              key={edge.id}
              edge={edge}
              nodes={nodes}
              isDimmed={isDimmed(edge.source, edge) && isDimmed(edge.target, edge)}
            />
          ))}
         {suggestedLinks.map((link) => (
          <EdgeComponent
            key={`sugg-${link.source}-${link.target}`}
            edge={{ id: `sugg-${link.source}-${link.target}`, source: link.source, target: link.target, label: link.reason }}
            nodes={nodes}
            isDimmed={false}
            isSuggestion
            onConfirm={() => onConfirmSuggestion(link)}
            onDismiss={() => onDismissSuggestion(link)}
          />
        ))}
        </svg>
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            isConnecting={node.id === connectingNodeId}
            isDimmed={isDimmed(node.id)}
            isHighlighted={highlightedNodes.has(node.id)}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick(node.id);
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onStartConnect={(e) => {
             e.stopPropagation();
             setConnectingNodeId(node.id);
            }}
          />
        ))}
      </div>
      {connectingNodeId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <Button variant="destructive" onClick={() => setConnectingNodeId(null)}>
                Cancel Connection
            </Button>
        </div>
      )}
    </div>
  );
}
