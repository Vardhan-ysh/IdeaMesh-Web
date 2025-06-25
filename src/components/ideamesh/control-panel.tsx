'use client';

import { useEffect, useState } from 'react';
import type { Node } from '@/lib/types';
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
import { Plus, Search, Trash2, X, Palette, Shapes, Image as ImageIcon, Check, Share2, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '../ui/sidebar';

interface ControlPanelProps {
  graphName: string;
  isPublic: boolean;
  onUpdateGraph: (updates: { name?: string; isPublic?: boolean }) => void;
  selectedNode: Node | null;
  onUpdateNode: (node: Node) => void;
  onDeleteNode: (nodeId: string) => void;
  onSmartSearch: (term: string) => void;
}

const nodeColors = [
  '#A08ABF', '#B4A8D3', '#87CEEB', '#98FB98', '#F0E68C', '#FFA07A', '#FFB6C1',
];

export default function ControlPanel({
  graphName,
  isPublic,
  onUpdateGraph,
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onSmartSearch,
}: ControlPanelProps) {
  const [currentGraphName, setCurrentGraphName] = useState(graphName);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { setOpen } = useSidebar();

  useEffect(() => {
    setCurrentGraphName(graphName);
  }, [graphName]);

  useEffect(() => {
    if (selectedNode) {
      setTitle(selectedNode.title);
      setContent(selectedNode.content);
      setTags(selectedNode.tags || []);
      setImageUrl(selectedNode.imageUrl || '');
    }
  }, [selectedNode]);
  
  const handleDebouncedSearch = (term: string) => {
    onSmartSearch(term);
  };
  
  useEffect(() => {
    const handler = setTimeout(() => {
      handleDebouncedSearch(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleUpdate = (field: keyof Node, value: any) => {
    if (selectedNode) {
      onUpdateNode({ ...selectedNode, [field]: value });
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

  return (
    <div className="flex h-full flex-col p-4 bg-sidebar-background text-sidebar-foreground">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-headline">Controls</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
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

      <div className="flex-1 overflow-y-auto">
        <Accordion type="single" collapsible defaultValue="graph-settings" className="w-full">
            <AccordionItem value="graph-settings">
                <AccordionTrigger>
                    <div className="flex items-center gap-2"><Settings className="h-4 w-4"/> Graph Settings</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <div>
                        <Label htmlFor="graph-name">Graph Name</Label>
                        <Input
                            id="graph-name"
                            value={currentGraphName}
                            onChange={(e) => setCurrentGraphName(e.target.value)}
                            onBlur={() => onUpdateGraph({ name: currentGraphName })}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="privacy-toggle">Public Graph</Label>
                        <Switch
                            id="privacy-toggle"
                            aria-label="Toggle graph privacy"
                            checked={isPublic}
                            onCheckedChange={(checked) => onUpdateGraph({ isPublic: checked })}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Public graphs can be viewed by anyone with the link.</p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {selectedNode ? (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Node Settings</h3>
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

                <Accordion type="single" collapsible>
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
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground mt-8">
            <p>Select a node to edit its properties, or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
