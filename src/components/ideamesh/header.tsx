'use client';

import { BrainCircuit, FileDown, Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AppHeaderProps {
  onSummarize: () => void;
  onSuggestLinks: () => void;
  onExport: (format: 'json' | 'markdown') => void;
  isSummarizing: boolean;
  isSuggesting: boolean;
}

export default function AppHeader({
  onSummarize,
  onSuggestLinks,
  onExport,
  isSummarizing,
  isSuggesting,
}: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 z-10 bg-card">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight text-foreground font-headline">
          IdeaMesh
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSuggestLinks}
          disabled={isSuggesting}
        >
          {isSuggesting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="mr-2 h-4 w-4" />
          )}
          Suggest Links
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSummarize}
          disabled={isSummarizing}
        >
          {isSummarizing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="mr-2 h-4 w-4" />
          )}
          Summarize
        </Button>
        <Separator orientation="vertical" className="h-6" />
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
        <SidebarTrigger />
      </div>
    </header>
  );
}
