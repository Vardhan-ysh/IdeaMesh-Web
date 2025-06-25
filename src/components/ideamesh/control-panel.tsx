
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Node, Edge } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, X, Palette, Shapes, Image as ImageIcon, Check, Edit, Link2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ControlPanelProps {
  selectedNode: Node | null;
  nodes: Node[];
  edges: Edge[];
  onUpdateNode: (node: Partial<Node> & {id: string}) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateEdge: (edgeId: string, newLabel: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onSmartSearch: (term: string) => void;
  onClose: () => void;
}

const nodeColors = [
  '#A08ABF', '#B4A8D3', '#87CEEB', '#98FB98', '#F0E68C', '#FFA07A', '#FFB6C1',
];

export default function ControlPanel({
  selectedNode,
  nodes,
  edges,
  onUpdateNode,
  onDeleteNode,
  onUpdateEdge,
  onDeleteEdge,
  onSmartSearch,
  onClose,
}: ControlPanelProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [edgeLabelInput, setEdgeLabelInput] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setTitle(selectedNode.title);
      setContent(selectedNode.content);
      setTags(selectedNode.tags || []);
      setImageUrl(selectedNode.imageUrl || '');
    } else {
      setEditingEdgeId(null);
    }
  }, [selectedNode]);

  const outgoingEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter(edge => edge.source === selectedNode.id);
  }, [selectedNode, edges]);

  const incomingEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter(edge => edge.target === selectedNode.id);
  }, [selectedNode, edges]);

  const handleStartEditEdge = (edge: Edge) => {
    setEditingEdgeId(edge.id);
    setEdgeLabelInput(edge.label);
  }

  const handleConfirmEditEdge = () => {
    if (editingEdgeId) {
      onUpdateEdge(editingEdgeId, edgeLabelInput);
      setEditingEdgeId(null);
      setEdgeLabelInput('');
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      onSmartSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSmartSearch]);

  const handleUpdate = (field: keyof Node, value: any) => {
    if (selectedNode) {
      onUpdateNode({ id: selectedNode.id, [field]: value });
    }
  };

  const handleTagAdd = () => {
    if (tagInput && !tags.includes(tagInput) && selectedNode) {
      const newTags = [...tags, tagInput];
      setTags(newTags);
      handleUpdate('tags', newTags);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    if (selectedNode) {
      const newTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(newTags);
      handleUpdate('tags', newTags);
    }
  };
  
  const renderEdgeItem = (edge: Edge, type: 'incoming' | 'outgoing') => {
    const otherNodeId = type === 'outgoing' ? edge.target : edge.source;
    const otherNode = nodes.find(n => n.id === otherNodeId);
    
    return (
      <div key={edge.id} className="text-sm p-2 rounded-md bg-secondary/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
            {type === 'outgoing' ? (
                <div className="truncate">
                    <span className="font-semibold text-primary">{edge.label}</span>
                    <span className="text-muted-foreground"> â†’ </span>
                    <span className="text-foreground">{otherNode?.title || '...'}</span>
                </div>
            ) : (
                <div className="truncate">
                    <span className="text-foreground">{otherNode?.title || '...'}</span>
                    <span className="text-muted-foreground"> â†’ </span>
                    <span className="font-semibold text-primary">{edge.label}</span>
                </div>
            )}
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleStartEditEdge(edge)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDeleteEdge(edge.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {editingEdgeId === edge.id && (
          <div className="flex items-center gap-2 animate-fade-in-up">
            <Input
              value={edgeLabelInput}
              onChange={(e) => setEdgeLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmEditEdge();
                if (e.key === 'Escape') setEditingEdgeId(null);
              }}
              className="h-8"
              autoFocus
            />
            <Button size="icon" className="h-8 w-8" onClick={handleConfirmEditEdge}><Check className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditingEdgeId(null)}><X className="h-4 w-4" /></Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col p-4 bg-sidebar-background/0 text-sidebar-foreground">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-headline">Controls</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Smart search..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Separator className="my-2"/>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {selectedNode ? (
          <div className="mt-4 animate-fade-in-up">
            <h3 className="text-md font-semibold mb-4">Node Settings</h3>
            <div className="space-y-6">
                <div>
                  <Label htmlFor="node-title">Title</Label>
                  <Input
                    id="node-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => handleUpdate('title', title)}
                  />
                </div>
                <div>
                  <Label htmlFor="node-content">Content</Label>
                  <Textarea
                    id="node-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={() => handleUpdate('content', content)}
                    rows={5}
                  />
                </div>

                <Accordion type="single" collapsible defaultValue="appearance">
                  <AccordionItem value="appearance">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2"><Palette className="h-4 w-4"/> Appearance</div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      <div>
                        <Label>Color</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {nodeColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleUpdate('color', color)}
                              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                                selectedNode.color === color ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Shape</Label>
                        <Select
                          value={selectedNode.shape}
                          onValueChange={(value: 'circle' | 'square') =>
                            handleUpdate('shape', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a shape" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circle">
                              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-foreground"/> Circle</div>
                            </SelectItem>
                            <SelectItem value="square">
                              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-sm bg-foreground"/> Square</div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="media-tags">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Media & Tags</div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      <div>
                        <Label htmlFor="node-image-url">Image URL</Label>
                        <Input
                          id="node-image-url"
                          placeholder="https://placehold.co/..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          onBlur={() => handleUpdate('imageUrl', imageUrl)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="node-tags">Tags</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="node-tags"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTagAdd()}
                            placeholder="Add a tag"
                          />
                          <Button size="icon" variant="outline" onClick={handleTagAdd}><Check className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="group">
                              {tag}
                              <button onClick={() => handleTagRemove(tag)} className="ml-2 opacity-50 group-hover:opacity-100">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="connections">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Connections</div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      {outgoingEdges.length === 0 && incomingEdges.length === 0 ? (
                        <p className="text-xs text-center text-muted-foreground p-4">No connections found.</p>
                      ) : (
                        <div className="space-y-4">
                          {outgoingEdges.length > 0 && (
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground mb-2">Outgoing</h5>
                              <div className="space-y-2">
                                {outgoingEdges.map(edge => renderEdgeItem(edge, 'outgoing'))}
                              </div>
                            </div>
                          )}
                           {incomingEdges.length > 0 && (
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground mb-2">Incoming</h5>
                              <div className="space-y-2">
                                {incomingEdges.map(edge => renderEdgeItem(edge, 'incoming'))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => onDeleteNode(selectedNode.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Node
                </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground mt-8 animate-fade-in">
            <p>Select a node to edit its properties, or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
