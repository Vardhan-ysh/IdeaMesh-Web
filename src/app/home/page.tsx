'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Share2, BrainCircuit, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PublicHomePage from '@/components/ideamesh/public-home';


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

  const handleCreateNewGraph = () => {
    const newGraphId = `graph_${Date.now()}`;
    router.push(`/graph/${newGraphId}`);
  };
  
  const graphs = [
    { id: '1', name: 'My Project Ideas', nodeCount: 12, lastEdited: '2 hours ago' },
    { id: '2', name: 'Book Notes: Sapiens', nodeCount: 45, lastEdited: '1 day ago' },
    { id: '3', name: 'Vacation Planning', nodeCount: 8, lastEdited: '3 days ago' },
  ];

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
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {graphs.map(graph => (
                 <Card key={graph.id}>
                   <CardHeader>
                     <CardTitle className="truncate">{graph.name}</CardTitle>
                     <CardDescription>{graph.nodeCount} nodes</CardDescription>
                   </CardHeader>
                   <CardContent>
                      <p className="text-sm text-muted-foreground">
                          Last edited: {graph.lastEdited}
                      </p>
                   </CardContent>
                   <CardFooter className="flex justify-between">
                     <Link href={`/graph/${graph.id}`} passHref>
                       <Button>Open</Button>
                     </Link>
                     <Button variant="ghost" size="icon">
                       <Share2 className="h-4 w-4" />
                     </Button>
                   </CardFooter>
                 </Card>
              ))}
            </div>
          </div>
        </main>
      ) : (
        <PublicHomePage />
      )}
    </div>
  );
}
