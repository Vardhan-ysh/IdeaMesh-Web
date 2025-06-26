
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Node, Edge, SuggestedLink } from '@/lib/types';
import NodeComponent from './node-component';
import EdgeComponent from './edge-component';
import { cn } from '@/lib/utils';

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
  const lastPointerPosition = useRef({ x: 0, y: 0 });
  const pinchStartDistance = useRef<number | null>(null);
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

  const handlePointerUp = useCallback(() => {
    if (dragStartInfo.current && !draggingNode) {
      onNodeClick(dragStartInfo.current.nodeId);
    }
    dragStartInfo.current = null;
    setDraggingNode(null);
    setIsPanning(false);
    setConnectionDrag(null);
    pinchStartDistance.current = null;
  }, [draggingNode, onNodeClick]);
  
  const handleEndConnect = (targetId: string) => {
    if (connectionDrag && connectionDrag.sourceId !== targetId) {
      onAddLink(connectionDrag.sourceId, targetId);
    }
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (dragStartInfo.current && !draggingNode) {
      const { nodeId, clientX: startX, clientY: startY } = dragStartInfo.current;
      const dx = clientX - startX;
      const dy = clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        const node = nodes.find(n => n.id === nodeId);
        if (node && graphRef.current) {
          const rect = graphRef.current.getBoundingClientRect();
          const pointerInWorldX = (startX - rect.left - transform.x) / transform.scale;
          const pointerInWorldY = (startY - rect.top - transform.y) / transform.scale;
          const offsetX = pointerInWorldX - node.x;
          const offsetY = pointerInWorldY - node.y;
          setDraggingNode({ id: nodeId, offsetX, offsetY });
        }
      }
    }

    if (isPanning) {
        const dx = clientX - lastPointerPosition.current.x;
        const dy = clientY - lastPointerPosition.current.y;
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        lastPointerPosition.current = { x: clientX, y: clientY };
    } else if (draggingNode && graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - transform.x) / transform.scale - draggingNode.offsetX;
      const y = (clientY - rect.top - transform.y) / transform.scale - draggingNode.offsetY;
      
      const draggedNode = nodes.find(n => n.id === draggingNode.id);
      if(draggedNode) {
        onNodeDrag({ ...draggedNode, x, y });
      }
    } else if (connectionDrag && graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - transform.x) / transform.scale;
      const y = (clientY - rect.top - transform.y) / transform.scale;
      setConnectionDrag(prev => prev ? { ...prev, endX: x, endY: y } : null);
    }
  }, [draggingNode, onNodeDrag, nodes, transform, isPanning, connectionDrag]);


  // MOUSE HANDLERS
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || e.target === graphRef.current?.firstChild) {
      setIsPanning(true);
      lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    }
  }, []);
  const handleMouseMove = useCallback((e: React.MouseEvent) => handlePointerMove(e.clientX, e.clientY), [handlePointerMove]);
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    dragStartInfo.current = { nodeId, clientX: e.clientX, clientY: e.clientY };
  };

  // TOUCH HANDLERS
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (e.target === graphRef.current || e.target === graphRef.current?.firstChild) {
          setIsPanning(true);
          lastPointerPosition.current = { x: touch.clientX, y: touch.clientY };
        }
    } else if (e.touches.length === 2 && graphRef.current) {
      setIsPanning(false);
      setDraggingNode(null);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      pinchStartDistance.current = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && graphRef.current && pinchStartDistance.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const scaleChange = currentDistance / pinchStartDistance.current;

      setTransform(prevTransform => {
        const newScale = prevTransform.scale * scaleChange;
        const clampedScale = Math.max(0.2, Math.min(3, newScale));
        if (clampedScale === prevTransform.scale) return prevTransform;
        
        const rect = graphRef.current!.getBoundingClientRect();
        const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
        const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

        const newX = centerX - (centerX - prevTransform.x) * (clampedScale / prevTransform.scale);
        const newY = centerY - (centerY - prevTransform.y) * (clampedScale / prevTransform.scale);

        return { scale: clampedScale, x: newX, y: newY };
      });
      pinchStartDistance.current = currentDistance;
    }
  }, [handlePointerMove]);
  
  const handleNodeTouchStart = (e: React.TouchEvent, nodeId: string) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      dragStartInfo.current = { nodeId, clientX: touch.clientX, clientY: touch.clientY };
    }
  };

  const handleStartConnect = (sourceId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (graphRef.current) {
      const getCoords = (ev: React.MouseEvent | React.TouchEvent) => {
        if ('touches' in ev) return ev.touches[0];
        return ev;
      };
      const coords = getCoords(e);
      const rect = graphRef.current.getBoundingClientRect();
      const x = (coords.clientX - rect.left - transform.x) / transform.scale;
      const y = (coords.clientY - rect.top - transform.y) / transform.scale;
      setConnectionDrag({ sourceId, endX: x, endY: y });
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
  
  const [prevNodeCount, setPrevNodeCount] = useState(nodes.length);
  const isNewNodeAdded = nodes.length > prevNodeCount;
  
  useEffect(() => {
      setPrevNodeCount(nodes.length);
  }, [nodes.length]);

  return (
    <div
      ref={graphRef}
      id="graph-canvas"
      className="relative w-full h-full bg-transparent overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: `linear-gradient(hsl(var(--border) / 0.6) 1px, transparent 1px),
                          linear-gradient(to right, hsl(var(--border) / 0.6) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
    >
      <div 
        className="absolute top-0 left-0"
        style={{
            width: '8000px',
            height: '8000px',
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onNodeClick(null);
        }}
      >
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 -5 10 10"
              refX="10"
              refY="0"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0,-5 L 10,0 L 0,5" fill={'hsl(var(--muted-foreground))'} />
            </marker>
            <marker
              id="arrow-suggestion"
              viewBox="0 -5 10 10"
              refX="10"
              refY="0"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0,-5 L 10,0 L 0,5" fill={'hsl(var(--accent))'} />
            </marker>
          </defs>
          {edges.map((edge) => (
            <EdgeComponent
              key={edge.id}
              edge={edge}
              nodes={nodes}
              edges={edges}
              isDimmed={isDimmed(edge.source, edge) && isDimmed(edge.target, edge)}
            />
          ))}
         {suggestedLinks.map((link) => (
          <EdgeComponent
            key={link.id}
            edge={{ id: link.id, source: link.source, target: link.target, label: link.reason }}
            nodes={nodes}
            edges={edges}
            isDimmed={false}
            isSuggestion
            onConfirm={() => onConfirmSuggestion(link)}
            onDismiss={() => onDismissSuggestion(link)}
          />
        ))}
        {sourceNodeForPreview && connectionDrag && (
            <line
                x1={sourceNodeForPreview.x + 90}
                y1={sourceNodeForPreview.y + 60}
                x2={connectionDrag.endX}
                y2={connectionDrag.endY}
                stroke="hsl(var(--accent))"
                strokeWidth="2"
                strokeDasharray="5,5"
            />
        )}
        </svg>
        {nodes.map((node, index) => (
          <NodeComponent
            key={node.id}
            domId={`node-${node.id}`}
            node={node}
            isSelected={node.id === selectedNodeId}
            isConnectionSource={node.id === connectionDrag?.sourceId}
            isDimmed={isDimmed(node.id)}
            isHighlighted={highlightedNodes.has(node.id)}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onTouchStart={(e) => handleNodeTouchStart(e, node.id)}
            onMouseUp={(e) => {
              e.stopPropagation();
              handleEndConnect(node.id);
              handlePointerUp();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              handleEndConnect(node.id);
              handlePointerUp();
            }}
            onStartConnect={(e) => handleStartConnect(node.id, e)}
            className={cn({
                'animate-scale-in': isNewNodeAdded && index === nodes.length - 1
            })}
          />
        ))}
      </div>
    </div>
  );
}
