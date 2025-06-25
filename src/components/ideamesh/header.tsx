'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrainCircuit, FileDown, LogOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface AppHeaderProps {
  graphName?: string;
  isPublic?: boolean;
  onUpdateGraph?: (updates: { name?: string; isPublic?: boolean }) => void;
  onExport: (format: 'json' | 'markdown') => void;
}

export default function AppHeader({
  graphName,
  isPublic,
  onUpdateGraph,
  onExport,
}: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [currentGraphName, setCurrentGraphName] = useState(graphName || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (graphName) {
      setCurrentGraphName(graphName);
    }
  }, [graphName]);
  
  const handleNameBlur = () => {
    if (graphName !== currentGraphName) {
      setIsSaving(true);
      onUpdateGraph?.({ name: currentGraphName });
      // A small delay to show saving state
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 z-10 bg-card">
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/home" className="flex items-center gap-2 flex-shrink-0">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground font-headline hidden sm:inline-block">
            IdeaMesh
          </h1>
        </Link>
        {graphName !== undefined && onUpdateGraph && (
            <>
                <Separator orientation='vertical' className='h-6 hidden sm:block' />
                <div className="flex items-center gap-4 min-w-0">
                   <Input
                        value={currentGraphName}
                        onChange={(e) => setCurrentGraphName(e.target.value)}
                        onBlur={handleNameBlur}
                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                        className="text-lg font-medium text-muted-foreground border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 p-1 h-auto bg-transparent truncate"
                        aria-label="Graph name"
                    />
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="privacy-toggle-header"
                            checked={isPublic}
                            onCheckedChange={(checked) => onUpdateGraph({ isPublic: checked })}
                            aria-label='Toggle graph privacy'
                        />
                        <Label htmlFor="privacy-toggle-header" className="text-sm text-muted-foreground hidden lg:block">
                          {isPublic ? 'Public' : 'Private'}
                        </Label>
                        <Globe className={`h-4 w-4 ${isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                </div>
            </>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className='hidden sm:flex items-center gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('markdown')}>
                  Export as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation="vertical" className="h-6" />
        </div>
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
        <SidebarTrigger />
      </div>
    </header>
  );
}
