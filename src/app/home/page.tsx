
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, LogOut, MoreHorizontal, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PublicHomePage from '@/components/ideamesh/public-home';
import { collection, query, where, getDocs, serverTimestamp, orderBy, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GraphMetadata, Node, Edge } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import LoadingScreen from '@/components/ideamesh/loading-screen';
import AppLogo from '@/components/ideamesh/app-logo';

function HomeHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/20 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Link href="/home" className="flex items-center gap-2">
        <AppLogo className="h-7 w-7" />
        <h1 className="text-xl font-semibold tracking-tight text-foreground font-headline">
          IdeaMesh
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link href="/auth" passHref>
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth" passHref>
              <Button>Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [graphs, setGraphs] = useState<GraphMetadata[]>([]);
  const [loadingGraphs, setLoadingGraphs] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [graphToDelete, setGraphToDelete] = useState<GraphMetadata | null>(null);

  useEffect(() => {
    const fetchGraphs = async () => {
      if (user) {
        try {
          setLoadingGraphs(true);
          const q = query(
            collection(db, 'graphs'),
            where('ownerId', '==', user.uid),
            orderBy('lastEdited', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const userGraphs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as GraphMetadata[];
          setGraphs(userGraphs);
        } catch (error) {
          console.error("Error fetching graphs:", error);
        } finally {
          setLoadingGraphs(false);
        }
      } else if (!loading) {
        setLoadingGraphs(false);
      }
    };
    fetchGraphs();
  }, [user, loading]);

  const handleCreateNewGraph = async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const graphRef = doc(collection(db, 'graphs'));

      // --- Define Initial Graph Structure ---
      const node1_id = uuidv4();
      const node2_id = uuidv4();
      const node3_id = uuidv4();
      const node4_id = uuidv4();
      const node5_id = uuidv4();

      const initialNodes: Node[] = [
        { id: node1_id, title: 'Welcome to IdeaMesh!', content: 'This is your new knowledge graph. Create nodes, connect them, and explore your ideas.', x: 450, y: 300, color: '#A08ABF', shape: 'circle', tags: ['getting-started'] },
        { id: node2_id, title: 'Create Nodes', content: 'Click the (+) button in the bottom right to add a new idea to your canvas.', x: 750, y: 150, color: '#B4A8D3', shape: 'square', tags: ['feature'] },
        { id: node3_id, title: 'Connect Ideas', content: 'To link two nodes, hover over one, then click and drag the small link icon to another node.', x: 800, y: 450, color: '#B4A8D3', shape: 'square', tags: ['feature'] },
        { id: node4_id, title: 'AI Assistant', content: 'Click the floating AI icon to open the chat. You can ask it to create nodes, find connections, summarize, or rearrange your graph!', x: 450, y: 550, color: '#A08ABF', shape: 'circle', tags: ['ai', 'feature'] },
        { id: node5_id, title: 'Edit & Customize', content: 'Click on any node to open the control panel on the right. You can change its title, content, color, shape, and more.', x: 150, y: 400, color: '#87CEEB', shape: 'circle', tags: ['feature'] },
      ];
      
      const initialEdges: Omit<Edge, 'id'>[] = [
        { source: node1_id, target: node2_id, label: 'shows how to' },
        { source: node1_id, target: node3_id, label: 'shows how to' },
        { source: node1_id, target: node4_id, label: 'explains the' },
        { source: node1_id, target: node5_id, label: 'explains how to' },
      ];

      // --- Batch Write to Firestore ---
      const newGraphData = {
        name: 'My First Graph',
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        lastEdited: serverTimestamp(),
        isPublic: false,
      };
      batch.set(graphRef, newGraphData);

      initialNodes.forEach(node => {
        const nodeRef = doc(db, 'graphs', graphRef.id, 'nodes', node.id);
        batch.set(nodeRef, node);
      });

      initialEdges.forEach(edge => {
          const edgeRef = doc(collection(db, 'graphs', graphRef.id, 'edges'));
          batch.set(edgeRef, edge);
      });

      await batch.commit();
      router.push(`/graph/${graphRef.id}`);

    } catch (error) {
      console.error("Error creating new graph:", error);
      toast({
        variant: 'destructive',
        title: 'Graph Creation Failed',
        description: 'Could not create a new graph. Please try again.',
      });
    }
  };

  const openDeleteDialog = (graph: GraphMetadata) => {
    setGraphToDelete(graph);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteGraph = async () => {
    if (!graphToDelete) return;

    const graphId = graphToDelete.id;
    const originalGraphs = graphs;
    
    setGraphs(prev => prev.filter(g => g.id !== graphId));
    setIsDeleteDialogOpen(false);

    try {
      const batch = writeBatch(db);
      
      const nodesRef = collection(db, 'graphs', graphId, 'nodes');
      const edgesRef = collection(db, 'graphs', graphId, 'edges');
      const [nodesSnap, edgesSnap] = await Promise.all([
        getDocs(nodesRef),
        getDocs(edgesRef)
      ]);
      nodesSnap.forEach(doc => batch.delete(doc.ref));
      edgesSnap.forEach(doc => batch.delete(doc.ref));
      
      const graphRef = doc(db, 'graphs', graphId);
      batch.delete(graphRef);

      await batch.commit();

      toast({
        title: 'Graph deleted',
        description: `The graph "${graphToDelete.name}" has been permanently deleted.`,
      });
      
    } catch (error) {
      console.error("Error deleting graph:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the graph. Please try again.',
      });
      setGraphs(originalGraphs);
    } finally {
        setGraphToDelete(null);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <HomeHeader />
      {user ? (
        <main className="flex-1 bg-transparent p-4 md:p-8">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Graphs</h2>
              <Button onClick={handleCreateNewGraph}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Graph
              </Button>
            </div>
            
            {loadingGraphs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : graphs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {graphs.map(graph => (
                  <Card key={graph.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{graph.name}</CardTitle>
                      <div className="h-4 w-4 text-muted-foreground"><AppLogo /></div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Last edited {graph.lastEdited ? formatDistanceToNow(graph.lastEdited.toDate(), { addSuffix: true }) : 'never'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/graph/${graph.id}`} passHref>
                        <Button className="w-full">
                          Open Graph
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 ml-2">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDeleteDialog(graph)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-lg font-semibold">Welcome!</h3>
                <p className="text-muted-foreground mb-4">You don't have any graphs yet. Create one to get started.</p>
                <Button onClick={handleCreateNewGraph}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Graph
                </Button>
              </div>
            )}
          </div>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the graph "{graphToDelete?.name}" and all of its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setGraphToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteGraph}
                  className={buttonVariants({ variant: "destructive" })}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      ) : (
        <PublicHomePage />
      )}
    </div>
  );
}

    
