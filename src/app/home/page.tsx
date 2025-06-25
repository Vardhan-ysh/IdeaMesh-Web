'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, BrainCircuit, LogOut, MoreHorizontal, Trash2 } from 'lucide-react';
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
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GraphMetadata } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

function HomeHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <Link href="/home" className="flex items-center gap-2">
        <BrainCircuit className="h-7 w-7 text-primary" />
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
      const newGraphData = {
        name: 'Untitled Graph',
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        lastEdited: serverTimestamp(),
        isPublic: false,
        nodeCount: 0,
      };
      const docRef = await addDoc(collection(db, 'graphs'), newGraphData);
      router.push(`/graph/${docRef.id}`);
    } catch (error) {
      console.error("Error creating new graph:", error);
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
    
    // Optimistically update UI
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
      // Rollback UI on failure
      setGraphs(originalGraphs);
    } finally {
        setGraphToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <HomeHeader />
      {user ? (
        <main className="flex-1 bg-background/95 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
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
                     <CardHeader>
                       <CardTitle className="truncate">{graph.name}</CardTitle>
                       <CardDescription>{graph.nodeCount || 0} nodes</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Last edited: {graph.lastEdited ? formatDistanceToNow(graph.lastEdited.toDate(), { addSuffix: true }) : 'Never'}
                        </p>
                     </CardContent>
                     <CardFooter className="flex justify-between">
                       <Link href={`/graph/${graph.id}`} passHref>
                         <Button>Open</Button>
                       </Link>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
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
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No graphs yet</h3>
                <p className="text-muted-foreground mt-2">Click "Create New Graph" to get started.</p>
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
