
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Node, Edge, SuggestedLink } from '@/lib/types';
import NodeComponent from './node-component';
import EdgeComponent from './edge-component';

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string | null) => void;
  onNodeDrag: (node: Node) => void;
  onAddLink: (source: string, target: string) => void;
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
  onAddLink,
  suggestedLinks,
  onConfirmSuggestion,
  onDismissSuggestion,
  highlightedNodes,
}: GraphViewProps) {
  const [draggingNode, setDraggingNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const dragStartInfo = useRef<{ nodeId: string; clientX: number; clientY: number } | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const [connectionDrag, setConnectionDrag] = useState<{ sourceId: string; endX: number; endY: number } | null>(null);

  useEffect(() => {
    const graphElement = graphRef.current;
    if (!graphElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setTransform((prevTransform) => {
        const zoomSensitivity = 0.1;
        const { deltaY } = e;
        const scaleChange = 1 - deltaY * zoomSensitivity * 0.1;
        const newScale = prevTransform.scale * scaleChange;
        const clampedScale = Math.max(0.2, Math.min(3, newScale));

        if (clampedScale === prevTransform.scale) {
          return prevTransform;
        }

        const rect = graphElement.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - (mouseX - prevTransform.x) * (clampedScale / prevTransform.scale);
        const newY = mouseY - (mouseY - prevTransform.y) * (clampedScale / prevTransform.scale);
        
        return { scale: clampedScale, x: newX, y: newY };
      });
    };

    graphElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      graphElement.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan if not clicking on a node (or other interactive element)
    if (e.target === e.currentTarget || e.target === graphRef.current?.firstChild) {
      setIsPanning(true);
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStartInfo.current && !draggingNode) {
      const { nodeId, clientX, clientY } = dragStartInfo.current;
      const dx = e.clientX - clientX;
      const dy = e.clientY - clientY;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        const node = nodes.find(n => n.id === nodeId);
        if (node && graphRef.current) {
          const rect = graphRef.current.getBoundingClientRect();
          const mouseInWorldX = (clientX - rect.left - transform.x) / transform.scale;
          const mouseInWorldY = (clientY - rect.top - transform.y) / transform.scale;
          const offsetX = mouseInWorldX - node.x;
          const offsetY = mouseInWorldY - node.y;
          setDraggingNode({ id: nodeId, offsetX, offsetY });
        }
      }
    }

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
    } else if (connectionDrag && graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale;
      const y = (e.clientY - rect.top - transform.y) / transform.scale;
      setConnectionDrag(prev => prev ? { ...prev, endX: x, endY: y } : null);
    }
  }, [draggingNode, onNodeDrag, nodes, transform, isPanning, connectionDrag]);

  const handleMouseUp = useCallback(() => {
    if (dragStartInfo.current && !draggingNode) {
      onNodeClick(dragStartInfo.current.nodeId);
    }
    dragStartInfo.current = null;
    setDraggingNode(null);
    setIsPanning(false);
    if (connectionDrag) {
      setConnectionDrag(null);
    }
  }, [draggingNode, onNodeClick, connectionDrag]);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    dragStartInfo.current = { nodeId, clientX: e.clientX, clientY: e.clientY };
  };
  
  const handleStartConnect = (sourceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.scale;
      const y = (e.clientY - rect.top - transform.y) / transform.scale;
      setConnectionDrag({ sourceId, endX: x, endY: y });
    }
  };
  
  const handleEndConnect = (targetId: string) => {
    if (connectionDrag && connectionDrag.sourceId !== targetId) {
      onAddLink(connectionDrag.sourceId, targetId);
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
  
  const sourceNodeForPreview = connectionDrag ? nodes.find(n => n.id === connectionDrag.sourceId) : null;

  return (
    <div
      ref={graphRef}
      className="relative w-full h-full bg-background overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                          linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={(e) => { 
          if(e.target === e.currentTarget) {
              onNodeClick(null); 
          }
      }}
    >
      <div 
        className="absolute top-0 left-0"
        style={{
            width: '8000px',
            height: '8000px',
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
        }}
      >
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={'hsl(var(--muted-foreground))'} />
            </marker>
            <marker
              id="arrow-suggestion"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={'hsl(var(--accent))'} />
            </marker>
          </defs>
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
            key={link.id}
            edge={{ id: link.id, source: link.source, target: link.target, label: link.reason }}
            nodes={nodes}
            isDimmed={false}
            isSuggestion
            onConfirm={() => onConfirmSuggestion(link)}
            onDismiss={() => onDismissSuggestion(link)}
          />
        ))}
        {sourceNodeForPreview && connectionDrag && (
            <line
                x1={sourceNodeForPreview.x}
                y1={sourceNodeForPreview.y}
                x2={connectionDrag.endX}
                y2={connectionDrag.endY}
                stroke="hsl(var(--accent))"
                strokeWidth="2"
                strokeDasharray="5,5"
            />
        )}
        </svg>
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            isConnectionSource={node.id === connectionDrag?.sourceId}
            isDimmed={isDimmed(node.id)}
            isHighlighted={highlightedNodes.has(node.id)}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onMouseUp={(e) => {
              e.stopPropagation();
              handleEndConnect(node.id);
              handleMouseUp();
            }}
            onStartConnect={(e) => handleStartConnect(node.id, e)}
          />
        ))}
      </div>
    </div>
  );
}
