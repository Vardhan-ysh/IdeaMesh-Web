
'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Node, Edge, GraphData, SuggestedLink, GraphMetadata, ChatMessage, ToolCall } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import AppHeader from '@/components/ideamesh/header';
import ControlPanel from '@/components/ideamesh/control-panel';
import GraphView from '@/components/ideamesh/graph-view';
import { useToast } from '@/hooks/use-toast';
import { summarizeGraph } from '@/ai/flows/graph-summarization';
import { suggestLinks } from '@/ai/flows/suggest-links';
import { smartSearch as runSmartSearch } from '@/ai/flows/smart-search';
import { chatWithGraph } from '@/ai/flows/chat-flow';
import { rearrangeGraph } from '@/ai/flows/rearrange-graph';
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
import { Plus, Loader2, FileText, Link2, LayoutDashboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, query, where } from 'firebase/firestore';
import ChatPanel from '@/components/ideamesh/chat-panel';
import Lottie from 'lottie-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCookie } from '@/hooks/use-cookie';
import GraphWalkthrough from '@/components/ideamesh/walkthrough';

function IdeaMeshContent({ graphId }: { graphId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [graphMetadata, setGraphMetadata] = useState<Partial<GraphMetadata>>({});
  
  const [loadingData, setLoadingData] = useState(true);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedLinks, setSuggestedLinks] = useState<SuggestedLink[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [isRearranging, setIsRearranging] = useState(false);
  
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeContent, setNewNodeContent] = useState('');
  
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [newLinkDetails, setNewLinkDetails] = useState<{ source: string; target: string } | null>(null);
  const [newLinkLabel, setNewLinkLabel] = useState('');

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const { setOpen, open } = useSidebar();
  
  const [animationData, setAnimationData] = useState(null);
  
  // Walkthrough State
  const [walkthroughActive, setWalkthroughActive] = useState(false);
  const [walkthroughCompleted, setWalkthroughCompleted] = useCookie('ideamesh_walkthrough_completed', 'false');

  useEffect(() => {
    // Run only on client
    if (typeof window !== 'undefined' && !loadingData && walkthroughCompleted === 'false') {
        setWalkthroughActive(true);
    }
  }, [loadingData, walkthroughCompleted]);

  const handleWalkthroughComplete = () => {
    setWalkthroughActive(false);
    setWalkthroughCompleted('true', 365); // Set cookie for 1 year
  };

  useEffect(() => {
    fetch('/assets/chat_ai_animation.json')
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data);
      })
      .catch((error) => console.error('Error loading animation:', error));
  }, []);

  useEffect(() => {
    const loadGraphData = async () => {
      if (!user || !graphId) return;
      try {
        setLoadingData(true);
        const graphRef = doc(db, 'graphs', graphId);
        const graphSnap = await getDoc(graphRef);

        if (!graphSnap.exists() || graphSnap.data()?.ownerId !== user.uid) {
          toast({ variant: 'destructive', title: 'Error', description: 'Graph not found or you do not have access.' });
          router.push('/home');
          return;
        }
        
        setGraphMetadata({ id: graphSnap.id, ...graphSnap.data() } as GraphMetadata);

        const nodesQuery = collection(db, 'graphs', graphId, 'nodes');
        const edgesQuery = collection(db, 'graphs', graphId, 'edges');

        const [nodesSnapshot, edgesSnapshot] = await Promise.all([
          getDocs(nodesQuery),
          getDocs(edgesQuery),
        ]);

        const fetchedNodes = nodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Node[];
        const fetchedEdges = edgesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Edge[];

        setNodes(fetchedNodes);
        setEdges(fetchedEdges);

      } catch (error) {
        console.error("Error loading graph:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load graph data.' });
        router.push('/home');
      } finally {
        setLoadingData(false);
      }
    };
    loadGraphData();
  }, [graphId, user, router, toast]);


  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );
  
  const handleCreateNode = useCallback(async (title: string, content: string): Promise<Node> => {
    if (!title.trim() || !graphId) {
      toast({ variant: 'destructive', title: 'Title is required' });
      throw new Error("Title is required");
    }
    
    const nodeRef = doc(collection(db, 'graphs', graphId, 'nodes'));
    
    const newNode: Node = {
      id: nodeRef.id,
      title: title,
      content: content,
      x: window.innerWidth / 2 - 90,
      y: window.innerHeight / 3,
      color: '#A08ABF',
      shape: 'circle',
      tags: [],
    };
    
    setNodes((prev) => [...prev, newNode]);
    
    try {
      const batch = writeBatch(db);
      
      batch.set(nodeRef, newNode);
      
      const graphRef = doc(db, 'graphs', graphId);
      batch.update(graphRef, { 
        lastEdited: serverTimestamp(), 
        nodeCount: nodes.length + 1 
      });

      await batch.commit();

      return newNode;

    } catch (error) {
      console.error("Error creating node:", error);
      toast({ variant: 'destructive', title: 'Error creating node' });
      setNodes((prev) => prev.filter(n => n.id !== newNode.id));
      throw error;
    }
  }, [graphId, toast, nodes]);

  const updateNode = useCallback(async (updatedNode: Partial<Node> & {id: string}) => {
    const originalNodes = nodes;
    setNodes((prev) => prev.map((node) => (node.id === updatedNode.id ? { ...node, ...updatedNode } : node)));

    if (!graphId) return;
    try {
      const nodeRef = doc(db, 'graphs', graphId, 'nodes', updatedNode.id);
      await setDoc(nodeRef, updatedNode, { merge: true });
      const graphRef = doc(db, 'graphs', graphId);
      await updateDoc(graphRef, { lastEdited: serverTimestamp() });
    } catch (error) {
      console.error("Error updating node:", error);
      toast({ variant: 'destructive', title: 'Error updating node' });
      setNodes(originalNodes);
    }
  }, [graphId, toast, nodes]);

  const handleNodeDrag = useCallback((draggedNode: Node) => {
    setNodes(prev => prev.map(n => n.id === draggedNode.id ? draggedNode : n));
    if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
    }
    dragTimeoutRef.current = setTimeout(async () => {
        if (!graphId) return;
        try {
            const nodeRef = doc(db, 'graphs', graphId, 'nodes', draggedNode.id);
            await updateDoc(nodeRef, { x: draggedNode.x, y: draggedNode.y });
        } catch (error) {
            console.error("Error updating node position:", error);
            toast({ variant: 'destructive', title: 'Error saving node position' });
        }
    }, 500);
  }, [graphId, toast]);


  const deleteNode = useCallback(async (nodeId: string) => {
    if (!graphId) return;
    const originalNodes = nodes;
    const originalEdges = edges;

    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    setEdges((prev) => prev.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setOpen(false);
    }
    
    try {
      const batch = writeBatch(db);

      const edgesToDeleteQuery1 = query(collection(db, 'graphs', graphId, 'edges'), where('source', '==', nodeId));
      const edgesToDeleteQuery2 = query(collection(db, 'graphs', graphId, 'edges'), where('target', '==', nodeId));
      
      const [sourceEdgesSnap, targetEdgesSnap] = await Promise.all([getDocs(edgesToDeleteQuery1), getDocs(edgesToDeleteQuery2)]);
      
      sourceEdgesSnap.forEach(edgeDoc => batch.delete(edgeDoc.ref));
      targetEdgesSnap.forEach(edgeDoc => batch.delete(edgeDoc.ref));
      
      const nodeRef = doc(db, 'graphs', graphId, 'nodes', nodeId);
      batch.delete(nodeRef);

      const graphRef = doc(db, 'graphs', graphId);
      batch.update(graphRef, { 
        lastEdited: serverTimestamp(), 
        nodeCount: nodes.length - 1 
      });

      await batch.commit();

    } catch (error) {
      console.error("Error deleting node:", error);
      toast({ variant: 'destructive', title: 'Error deleting node' });
      setNodes(originalNodes);
      setEdges(originalEdges);
    }
  }, [graphId, toast, nodes, edges, selectedNodeId, setOpen]);

  const addEdge = useCallback(async (source: string, target: string, label: string) => {
    if (source === target || !graphId) return;
    if (nodes.findIndex(n => n.id === source) === -1 || nodes.findIndex(n => n.id === target) === -1) {
      toast({ variant: 'destructive', title: 'Cannot create link', description: 'One of the nodes does not exist.' });
      return;
    }
    
    const originalEdges = edges;
    const edgeRef = doc(collection(db, 'graphs', graphId, 'edges'));
    const newEdge: Edge = { id: edgeRef.id, source, target, label };
    
    setEdges((prev) => [...prev, newEdge]);
    
    try {
      const batch = writeBatch(db);
      batch.set(edgeRef, newEdge);
      const graphRef = doc(db, 'graphs', graphId);
      batch.update(graphRef, { lastEdited: serverTimestamp() });
      await batch.commit();
    } catch (error) {
        console.error("Error adding edge:", error);
        toast({ variant: 'destructive', title: 'Error adding edge' });
        setEdges(originalEdges);
    }
  }, [graphId, toast, edges, nodes]);

  const updateEdge = useCallback(async (edgeId: string, newLabel: string) => {
    if (!graphId) return;
    const originalEdges = edges;
    setEdges((prev) => prev.map((edge) => (edge.id === edgeId ? { ...edge, label: newLabel } : edge)));

    try {
      const edgeRef = doc(db, 'graphs', graphId, 'edges', edgeId);
      await updateDoc(edgeRef, { label: newLabel });
      const graphRef = doc(db, 'graphs', graphId);
      await updateDoc(graphRef, { lastEdited: serverTimestamp() });
    } catch (error) {
      console.error("Error updating edge:", error);
      toast({ variant: 'destructive', title: 'Error updating edge' });
      setEdges(originalEdges);
    }
  }, [graphId, toast, edges]);

  const deleteEdge = useCallback(async (edgeId: string) => {
    if (!graphId) return;
    const originalEdges = edges;
    setEdges((prev) => prev.filter((edge) => edge.id !== edgeId));

    try {
      const edgeRef = doc(db, 'graphs', graphId, 'edges', edgeId);
      await deleteDoc(edgeRef);
      const graphRef = doc(db, 'graphs', graphId);
      await updateDoc(graphRef, { lastEdited: serverTimestamp() });
    } catch (error) {
      console.error("Error deleting edge:", error);
      toast({ variant: 'destructive', title: 'Error deleting edge' });
      setEdges(originalEdges);
    }
  }, [graphId, toast, edges]);


  const onNodeClick = useCallback((nodeId: string | null) => {
    if (!nodeId) {
      if (open) {
        setOpen(false);
        setSelectedNodeId(null);
      }
    } else {
      setSelectedNodeId(nodeId);
      setOpen(true);
      setIsChatOpen(false);
    }
  }, [open, setOpen]);

  const handleToggleChat = () => {
    const newChatState = !isChatOpen;
    setIsChatOpen(newChatState);
    if (newChatState) {
      setOpen(false);
      setSelectedNodeId(null);
    }
  };

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

  const handleUpdateGraph = useCallback(async (updates: Partial<Pick<GraphMetadata, 'name' | 'isPublic'>>) => {
    if (!graphId) return;
    const currentMeta = graphMetadata;
    setGraphMetadata(prev => ({...prev, ...updates}));

    try {
        const graphRef = doc(db, 'graphs', graphId);
        await updateDoc(graphRef, {
            ...updates,
            lastEdited: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating graph metadata:", error);
        toast({ variant: 'destructive', title: 'Error updating graph settings' });
        setGraphMetadata(currentMeta);
    }
  }, [graphId, toast, graphMetadata]);

  const handleSummarize = async (outputTarget: 'dialog' | 'chat' = 'dialog') => {
    setIsSummarizing(true);
    if (outputTarget === 'dialog') {
      setSummary('');
    }
    try {
      const graphData: GraphData = { nodes, edges };
      const result = await summarizeGraph({ graphData: JSON.stringify(graphData) });

      if (outputTarget === 'dialog') {
        setSummary(result.summary);
      } else {
        const summaryMessage: ChatMessage = {
          id: uuidv4(),
          role: 'model',
          text: `Here's a summary of your graph:\n\n${result.summary}`,
        };
        setChatMessages(prev => [...prev, summaryMessage]);
      }
    } catch (error) {
      console.error('Error summarizing graph:', error);
      if (outputTarget === 'dialog') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate summary.',
        });
      } else {
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          role: 'model',
          text: 'Sorry, I encountered an error while generating the summary.',
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } finally {
        setIsSummarizing(false);
    }
  };
  
  const handleSuggestLinks = async (outputTarget: 'toast' | 'chat' = 'toast') => {
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

      if (outputTarget === 'toast') {
        if (result.length === 0) {
          toast({ title: 'No new link suggestions found.' });
        } else {
          toast({ title: `Found ${result.length} new link suggestions!`, description: 'Confirm or dismiss them on the graph.' });
        }
      } else {
          let responseText = '';
          if (result.length === 0) {
            responseText = "I couldn't find any new link suggestions right now.";
          } else {
            responseText = `I've found ${result.length} new link suggestion(s) and displayed them on the graph for you to review.`;
          }
          const suggestionsMessage: ChatMessage = {
            id: uuidv4(),
            role: 'model',
            text: responseText,
          };
          setChatMessages(prev => [...prev, suggestionsMessage]);
      }
    } catch (error) {
      console.error('Error suggesting links:', error);
      if (outputTarget === 'toast') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to get link suggestions.',
        });
      } else {
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          role: 'model',
          text: 'Sorry, I had trouble finding link suggestions.',
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleRearrangeGraph = async (centerNodeTitle?: string) => {
    setIsRearranging(true);
    try {
      const canvasSize = {
          width: window.innerWidth,
          height: window.innerHeight,
      };

      let centerNodeId: string | undefined = undefined;
      if (centerNodeTitle) {
        const centerNode = nodes.find(n => n.title.toLowerCase() === centerNodeTitle.toLowerCase());
        if (centerNode) {
          centerNodeId = centerNode.id;
        } else {
          toast({ variant: 'destructive', title: 'Rearrange Error', description: `Node with title "${centerNodeTitle}" not found.` });
          setIsRearranging(false);
          return;
        }
      }

      const nodeDataForAI = nodes.map(n => ({ id: n.id, title: n.title, content: n.content, x: n.x, y: n.y }));
      const edgeDataForAI = edges.map(e => ({ source: e.source, target: e.target, label: e.label }));

      const result = await rearrangeGraph({ nodes: nodeDataForAI, edges: edgeDataForAI, canvasSize, centerNodeId });

      if (!result.positions || result.positions.length === 0) {
        toast({ variant: 'destructive', title: 'Rearrange Failed', description: 'The AI could not determine a new layout.' });
        return;
      }
      
      const originalNodes = nodes;
      const updatedNodes = nodes.map(node => {
        const newPosition = result.positions.find(p => p.nodeId === node.id);
        return newPosition ? { ...node, x: newPosition.x, y: newPosition.y } : node;
      });
      setNodes(updatedNodes);

      if (!graphId) return;
      const batch = writeBatch(db);
      result.positions.forEach(pos => {
        if (pos.nodeId && pos.x !== undefined && pos.y !== undefined) {
          const nodeRef = doc(db, 'graphs', graphId, 'nodes', pos.nodeId);
          batch.update(nodeRef, { x: pos.x, y: pos.y });
        }
      });

      await batch.commit();

      toast({ title: 'Graph Rearranged!', description: 'The AI has organized your graph.' });

    } catch (error) {
      console.error('Error rearranging graph:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to rearrange the graph.',
      });
    } finally {
      setIsRearranging(false);
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
      let md = `# ${graphMetadata.name || 'IdeaMesh Graph'}\n\n`;
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

  const handleToolCalls = useCallback(async (toolCalls: ToolCall[]) => {
    // New transactional logic for creating nodes and edges together
    const tempIdToRealIdMap = new Map<string, string>();
    const nodesToAdd: Node[] = [];
    const edgesToAdd: Edge[] = [];
    
    // Create a local, mutable copy of nodes for validation within this operation
    const workingNodeList = [...nodes];
    
    const addNodeCalls = toolCalls.filter(call => call.name === 'addNode');
    for (const call of addNodeCalls) {
      const { title, content, tempId } = call.args;
      if (!title?.trim() || !graphId) continue;
      
      const nodeRef = doc(collection(db, 'graphs', graphId, 'nodes'));
      const newNode: Node = {
        id: nodeRef.id,
        title,
        content: content || '',
        x: window.innerWidth / 2 - 90 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 3 + (Math.random() - 0.5) * 200,
        color: '#A08ABF',
        shape: 'circle',
        tags: [],
      };
      
      nodesToAdd.push(newNode);
      workingNodeList.push(newNode); // Add to our temporary list for validation
      if (tempId) {
        tempIdToRealIdMap.set(tempId, newNode.id);
      }
    }
    
    const addEdgeCalls = toolCalls.filter(call => call.name === 'addEdge');
    for (const call of addEdgeCalls) {
      const { sourceNodeId, targetNodeId, label } = call.args;
      const realSourceId = tempIdToRealIdMap.get(sourceNodeId) || sourceNodeId;
      const realTargetId = tempIdToRealIdMap.get(targetNodeId) || targetNodeId;

      if (workingNodeList.some(n => n.id === realSourceId) && workingNodeList.some(n => n.id === realTargetId)) {
        const edgeRef = doc(collection(db, 'graphs', graphId, 'edges'));
        const newEdge: Edge = { id: edgeRef.id, source: realSourceId, target: realTargetId, label: label || 'related to' };
        edgesToAdd.push(newEdge);
      } else {
        console.warn(`AI edge creation skipped: Cannot find nodes for edge between '${sourceNodeId}' and '${targetNodeId}'.`);
      }
    }

    if (nodesToAdd.length > 0 || edgesToAdd.length > 0) {
      try {
        const batch = writeBatch(db);

        nodesToAdd.forEach(node => {
          const nodeRef = doc(db, 'graphs', graphId, 'nodes', node.id);
          batch.set(nodeRef, node);
        });

        edgesToAdd.forEach(edge => {
          const edgeRef = doc(db, 'graphs', graphId, 'edges', edge.id);
          batch.set(edgeRef, edge);
        });

        const graphRef = doc(db, 'graphs', graphId);
        batch.update(graphRef, {
          lastEdited: serverTimestamp(),
          nodeCount: nodes.length + nodesToAdd.length
        });
        
        await batch.commit();

        if (nodesToAdd.length > 0) {
          setNodes(prev => [...prev, ...nodesToAdd]);
          toast({ title: 'AI created nodes', description: `${nodesToAdd.length} node(s) have been added.` });
        }
        if (edgesToAdd.length > 0) {
          setEdges(prev => [...prev, ...edgesToAdd]);
          toast({ title: 'AI created links', description: `${edgesToAdd.length} link(s) have been added.` });
        }
      } catch (error) {
        console.error("Error in AI batch creation:", error);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to create new nodes and links.' });
      }
    }

    // Process other calls (update, delete) using the old method for now
    const otherCalls = toolCalls.filter(call => call.name !== 'addNode' && call.name !== 'addEdge');
    for (const call of otherCalls) {
      switch (call.name) {
        case 'rearrangeGraph':
          const { centerNodeTitle } = call.args;
          handleRearrangeGraph(centerNodeTitle);
          toast({ title: 'AI is rearranging the graph...' });
          break;
        case 'updateNode':
          const { nodeId, ...updates } = call.args;
          updateNode({ id: nodeId, ...updates });
          toast({ title: 'AI updated a node', description: `Updated node ID: ${nodeId}` });
          break;
        case 'deleteNode':
          deleteNode(call.args.nodeId);
          toast({ title: 'AI deleted a node', description: `Deleted node ID: ${call.args.nodeId}` });
          break;
        case 'updateEdge':
          updateEdge(call.args.edgeId, call.args.newLabel);
          toast({ title: 'AI updated a link', description: `Updated link ID: ${call.args.edgeId}` });
          break;
        case 'deleteEdge':
          deleteEdge(call.args.edgeId);
          toast({ title: 'AI deleted a link', description: `Deleted link ID: ${call.args.edgeId}` });
          break;
        default:
          console.warn(`Unknown tool call: ${call.name}`);
      }
    }
  }, [nodes, edges, graphId, toast, updateNode, deleteNode, updateEdge, deleteEdge, handleRearrangeGraph]);

  const handleSendChatMessage = async (text: string) => {
    const newUserMessage: ChatMessage = { id: uuidv4(), role: 'user', text };
    const currentMessages = [...chatMessages, newUserMessage];
    setChatMessages(currentMessages);
    setIsAiThinking(true);

    try {
      const history = currentMessages.map(({ role, text }) => ({ role, text }));
      const graphData = JSON.stringify({
        nodes: nodes.map(({ id, title, content }) => ({ id, title, content })),
        edges: edges.map(({ id, source, target, label }) => ({ id, source, target, label })),
      });

      const result = await chatWithGraph({ history, graphData });
      
      const newAiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        text: result.text,
      };
      setChatMessages(prev => [...prev, newAiMessage]);

      if (result.toolCalls && result.toolCalls.length > 0) {
        await handleToolCalls(result.toolCalls);
      }

    } catch (error) {
      console.error("Chat error:", error);
      toast({ variant: 'destructive', title: 'Chat Error', description: 'The AI is having trouble responding.' });
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiThinking(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-transparent font-body">
       {walkthroughActive && nodes.length > 0 && (
        <GraphWalkthrough
          onComplete={handleWalkthroughComplete}
          onSelectNode={onNodeClick}
          initialNodeId={selectedNodeId}
          firstNodeId={nodes[0]?.id}
          secondNodeId={nodes[1]?.id}
        />
      )}
      <AppHeader
        graphName={graphMetadata.name}
        isPublic={graphMetadata.isPublic}
        onUpdateGraph={handleUpdateGraph}
        onExport={exportData}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar variant="floating" side="right">
          <ControlPanel
            selectedNode={selectedNode}
            onUpdateNode={updateNode}
            onDeleteNode={deleteNode}
            onSmartSearch={handleSmartSearch}
            onClose={() => onNodeClick(null)}
          />
        </Sidebar>
        <SidebarInset>
          <GraphView
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            onNodeClick={onNodeClick}
            onNodeDrag={handleNodeDrag}
            onAddLink={handleRequestAddLink}
            suggestedLinks={suggestedLinks}
            onConfirmSuggestion={handleConfirmSuggestion}
            onDismissSuggestion={handleDismissSuggestion}
            highlightedNodes={highlightedNodes}
          />
          <div id="ai-actions-bar" className="absolute top-20 left-4 z-10 flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    id="ai-chat-button"
                    onClick={handleToggleChat}
                    className="h-12 w-12 rounded-full shadow-lg flex items-center justify-center bg-primary/80 backdrop-blur-lg transition-transform hover:scale-110 active:scale-100 animate-pulse-glow"
                    aria-label="Toggle AI Chat"
                    size="icon"
                  >
                    {animationData ? (
                      <Lottie animationData={animationData} loop={true} style={{ width: 48, height: 48 }} />
                    ) : (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Toggle AI Chat</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button
                    onClick={() => handleSummarize('dialog')}
                    disabled={isSummarizing || isSuggesting || isRearranging}
                    variant="outline"
                    className="shadow-lg transition-transform hover:scale-105 active:scale-100 backdrop-blur-lg bg-card/80"
                  >
                    {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    Summarize
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Get an AI summary of the graph</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleSuggestLinks('toast')}
                    disabled={isSuggesting || isSummarizing || isRearranging}
                    variant="outline"
                    className="shadow-lg transition-transform hover:scale-105 active:scale-100 backdrop-blur-lg bg-card/80"
                  >
                    {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                    Suggest Links
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Let AI suggest new connections</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button
                    onClick={() => handleRearrangeGraph()}
                    disabled={isRearranging || isSuggesting || isSummarizing}
                    variant="outline"
                    className="shadow-lg transition-transform hover:scale-105 active:scale-100 backdrop-blur-lg bg-card/80"
                  >
                    {isRearranging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LayoutDashboard className="mr-2 h-4 w-4" />}
                    Rearrange
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Organize graph with AI</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            id="add-node-button"
            onClick={() => setIsAddNodeDialogOpen(true)}
            className="absolute bottom-20 right-8 z-10 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-100 animate-pulse-glow"
            size="icon"
            aria-label="Add new node"
            style={{ animationDelay: '0.5s' }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SidebarInset>
      </div>
      <AlertDialog
        open={!!summary}
        onOpenChange={(open) => !open && setSummary('')}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Graph Summary</AlertDialogTitle>
            <AlertDialogDescription className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
              {summary || 'Generating summary...'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSummary('')}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={isAddNodeDialogOpen}
        onOpenChange={setIsAddNodeDialogOpen}
      >
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
            <Button onClick={async () => {
              if (!newNodeTitle.trim()) {
                  toast({ variant: 'destructive', title: 'Title is required' });
                  return;
              }
              try {
                  const newNode = await handleCreateNode(newNodeTitle, newNodeContent);
                  setSelectedNodeId(newNode.id);
                  setIsChatOpen(false); // Close chat if open
                  setOpen(true); // Open controls
                  setIsAddNodeDialogOpen(false);
                  setNewNodeTitle('');
                  setNewNodeContent('');
              } catch (error) {
                  // toast is already handled in handleCreateNode
              }
            }}>Create Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isAddLinkDialogOpen}
        onOpenChange={setIsAddLinkDialogOpen}
      >
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
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent
          side="left"
          showOverlay={true}
          className="p-0 w-full max-w-[28rem] rounded-r-2xl border-r-0 flex flex-col overflow-hidden"
        >
          <SheetHeader className="p-4 border-b border-border/20 shrink-0">
            <SheetTitle>GraphAI Assistant</SheetTitle>
            <SheetDescription>Chat with your graph to create, edit, and get insights.</SheetDescription>
          </SheetHeader>
          <ChatPanel
            animationData={animationData}
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            isLoading={isAiThinking}
            onSummarize={() => handleSummarize('chat')}
            onSuggestLinks={() => handleSuggestLinks('chat')}
            isSummarizing={isSummarizing}
            isSuggesting={isSuggesting}
            userAvatarUrl={user?.photoURL}
            userDisplayName={user?.displayName}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}


export default function GraphPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const graphId = params.graphId as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <IdeaMeshContent graphId={graphId} />
    </SidebarProvider>
  );
}

    

    
