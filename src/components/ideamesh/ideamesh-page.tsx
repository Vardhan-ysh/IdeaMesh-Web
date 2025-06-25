
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Node, Edge, GraphData, SuggestedLink } from '@/lib/types';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppHeader from '@/components/ideamesh/header';
import ControlPanel from '@/components/ideamesh/control-panel';
import GraphView from '@/components/ideamesh/graph-view';
import { useToast } from '@/hooks/use-toast';
import { summarizeGraph } from '@/ai/flows/graph-summarization';
import { suggestLinks } from '@/ai/flows/suggest-links';
import { smartSearch as runSmartSearch } from '@/ai/flows/smart-search';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const initialNodes: Node[] = [
  { id: '1', title: 'Welcome to IdeaMesh!', content: 'This is an interactive knowledge graph. Create nodes, connect them, and explore your ideas.', x: 250, y: 150, color: '#A08ABF', shape: 'circle', tags: ['getting-started'] },
  { id: '2', title: 'Create Nodes', content: 'Add new ideas by using the "Add Node" button. You can give each node a title and content.', x: 550, y: 100, color: '#B4A8D3', shape: 'square', tags: ['feature'] },
  { id: '3', title: 'Connect Ideas', content: 'Create relationships between nodes by clicking the link icon on a node and then selecting another node.', x: 600, y: 300, color: '#B4A8D3', shape: 'square', tags: ['feature'] },
  { id: '4', title: 'AI-Powered Insights', content: 'Use the AI features in the header to summarize your graph or get suggestions for new links.', x: 250, y: 350, color: '#A08ABF', shape: 'circle', tags: ['ai', 'feature'] },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'explains' },
  { id: 'e1-3', source: '1', target: '3', label: 'explains' },
  { id: 'e1-4', source: '1', target: '4', label: 'explains' },
];

export default function IdeaMeshPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedLinks, setSuggestedLinks] = useState<SuggestedLink[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeContent, setNewNodeContent] = useState('');
  
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [newLinkDetails, setNewLinkDetails] = useState<{ source: string; target: string } | null>(null);
  const [newLinkLabel, setNewLinkLabel] = useState('');

  const { toast } = useToast();

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  useEffect(() => {
    if (selectedNodeId) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [selectedNodeId]);
  
  const handleCreateNode = useCallback(() => {
    if (!newNodeTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Title is required',
        description: 'Please enter a title for the new node.',
      });
      return;
    }
    const newNodeId = Date.now().toString();
    const newNode: Node = {
      id: newNodeId,
      title: newNodeTitle,
      content: newNodeContent,
      x: window.innerWidth / 2 - 90,
      y: window.innerHeight / 3,
      color: '#A08ABF',
      shape: 'circle',
      tags: [],
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNodeId);
    setIsAddNodeDialogOpen(false);
    setNewNodeTitle('');
    setNewNodeContent('');
  }, [newNodeTitle, newNodeContent, toast]);

  const updateNode = useCallback((updatedNode: Node) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    setEdges((prev) =>
      prev.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const addEdge = useCallback((source: string, target: string, label: string) => {
    if (source === target) return;
    const newEdge: Edge = {
      id: `e${source}-${target}-${Date.now()}`,
      source,
      target,
      label,
    };
    setEdges((prev) => [...prev, newEdge]);
  }, []);

  const onNodeClick = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleRequestAddLink = useCallback((source: string, target: string) => {
    setNewLinkDetails({ source, target });
    setNewLinkLabel('related to');
    setIsAddLinkDialogOpen(true);
  }, []);

  const handleCreateLink = () => {
    if (newLinkDetails && newLinkLabel.trim()) {
      addEdge(newLinkDetails.source, newLinkDetails.target, newLinkLabel);
    }
    setIsAddLinkDialogOpen(false);
    setNewLinkDetails(null);
    setNewLinkLabel('');
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary('');
    try {
      const graphData: GraphData = { nodes, edges };
      const result = await summarizeGraph({ graphData: JSON.stringify(graphData) });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error summarizing graph:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate summary.',
      });
    }
  };
  
  const handleSuggestLinks = async () => {
    setIsSuggesting(true);
    try {
      const nodeDataForAI = nodes.map(n => ({ id: n.id, title: n.title, content: n.content}));
      const existingLinksForAI = edges.map(e => ({source: e.source, target: e.target, label: e.label}));
      
      const result = await suggestLinks({ nodes: nodeDataForAI, existingLinks: existingLinksForAI });
      const suggestionsWithIds = result.map((link, index) => ({
        ...link,
        id: `sugg-${Date.now()}-${index}`
      }));
      setSuggestedLinks(suggestionsWithIds);

      if (result.length === 0) {
        toast({ title: 'No new link suggestions found.' });
      } else {
        toast({ title: `Found ${result.length} new link suggestions!`, description: 'Confirm or dismiss them on the graph.' });
      }
    } catch (error) {
      console.error('Error suggesting links:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get link suggestions.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSmartSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setHighlightedNodes(new Set());
      return;
    }

    try {
        const graphContext = JSON.stringify({
            nodes: nodes.map(n => ({id: n.id, title: n.title})),
            edges: edges.map(e => ({source: e.source, target: e.target, label: e.label}))
        });
        const result = await runSmartSearch({ searchTerm, graphContext });
        
        const directMatches = nodes
            .filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(n => n.id);

        const suggestionMatches = nodes
            .filter(n => result.suggestions.includes(n.title))
            .map(n => n.id);
            
        setHighlightedNodes(new Set([...directMatches, ...suggestionMatches]));
        
    } catch (error) {
        console.error('Smart search failed:', error);
        toast({ variant: 'destructive', title: 'Smart Search Error', description: 'Could not perform smart search.' });
        const directMatches = nodes
            .filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(n => n.id);
        setHighlightedNodes(new Set(directMatches));
    }
  };
  
  const exportData = (format: 'json' | 'markdown') => {
    const graphData: GraphData = { nodes, edges };
    let dataStr: string;
    let fileName: string;
    let fileType: string;

    if (format === 'json') {
      dataStr = JSON.stringify(graphData, null, 2);
      fileName = 'ideamesh-graph.json';
      fileType = 'application/json';
    } else {
      let md = '# IdeaMesh Graph\n\n';
      md += '## Nodes\n';
      nodes.forEach(n => {
        md += `### ${n.title} (ID: ${n.id})\n`;
        md += `${n.content}\n\n`;
      });
      md += '## Edges\n';
      edges.forEach(e => {
        const sourceNode = nodes.find(n => n.id === e.source);
        const targetNode = nodes.find(n => n.id === e.target);
        if (sourceNode && targetNode) {
          md += `- **${sourceNode.title}** --[${e.label}]--> **${targetNode.title}**\n`;
        }
      });
      dataStr = md;
      fileName = 'ideamesh-graph.md';
      fileType = 'text/markdown';
    }

    const blob = new Blob([dataStr], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Export Successful', description: `Graph exported as ${fileName}` });
  };
  
  const handleConfirmSuggestion = (link: SuggestedLink) => {
    addEdge(link.source, link.target, link.reason);
    setSuggestedLinks(prev => prev.filter(l => l.id !== link.id));
  };

  const handleDismissSuggestion = (link: SuggestedLink) => {
    setSuggestedLinks(prev => prev.filter(l => l.id !== link.id));
  };


  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className="flex h-screen w-full flex-col bg-background font-body">
        <AppHeader 
          onSummarize={handleSummarize}
          onSuggestLinks={handleSuggestLinks}
          onExport={exportData}
          isSummarizing={isSummarizing}
          isSuggesting={isSuggesting}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar variant="floating" collapsible="offcanvas" side="right">
            <ControlPanel
              selectedNode={selectedNode}
              onUpdateNode={updateNode}
              onDeleteNode={deleteNode}
              onSmartSearch={handleSmartSearch}
            />
          </Sidebar>
          <SidebarInset>
            <GraphView
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              onNodeClick={onNodeClick}
              onNodeDrag={updateNode}
              onAddLink={handleRequestAddLink}
              suggestedLinks={suggestedLinks}
              onConfirmSuggestion={handleConfirmSuggestion}
              onDismissSuggestion={handleDismissSuggestion}
              highlightedNodes={highlightedNodes}
            />
             <Button
              onClick={() => setIsAddNodeDialogOpen(true)}
              className="absolute bottom-16 right-8 z-10 h-14 w-14 rounded-full shadow-lg"
              size="icon"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </SidebarInset>
        </div>
      </div>
      <AlertDialog open={!!summary} onOpenChange={(open) => !open && setSummary('')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Graph Summary</AlertDialogTitle>
            <AlertDialogDescription className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
              {summary || "Generating summary..."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setSummary(''); setIsSummarizing(false); }}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isAddNodeDialogOpen} onOpenChange={setIsAddNodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Node</DialogTitle>
            <DialogDescription>
              Add a new idea to your graph. Give it a title and some content.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newNodeTitle}
                onChange={(e) => setNewNodeTitle(e.target.value)}
                className="col-span-3"
                placeholder="Your brilliant idea"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <Textarea
                id="content"
                value={newNodeContent}
                onChange={(e) => setNewNodeContent(e.target.value)}
                className="col-span-3"
                placeholder="Describe your idea in more detail..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateNode}>Create Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddLinkDialogOpen} onOpenChange={setIsAddLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Enter a label for the relationship.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="link-label">Label</Label>
            <Input
              id="link-label"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="e.g., related to, explains, contradicts"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateLink}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
