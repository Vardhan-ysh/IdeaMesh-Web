'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Node, Edge, SuggestedLink } from '@/lib/types';
import NodeComponent from './node-component';
import EdgeComponent from './edge-component';
import { Button } from '@/components/ui/button';

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
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
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1, height: 1 });

  useEffect(() => {
    if (graphRef.current) {
        setViewBox({
            x: 0,
            y: 0,
            width: graphRef.current.clientWidth,
            height: graphRef.current.clientHeight,
        });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNode && graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - draggingNode.offsetX;
      const y = e.clientY - rect.top - draggingNode.offsetY;
      
      const draggedNode = nodes.find(n => n.id === draggingNode.id);
      if(draggedNode) {
        onNodeDrag({ ...draggedNode, x, y });
      }
    }
  }, [draggingNode, onNodeDrag, nodes]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDraggingNode({ id: nodeId, offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY });
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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => { onNodeClick(null); setConnectingNodeId(null); }}
    >
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
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
