'use client';

import type { ChatMessage } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Loader2, Send, BrainCircuit, Link2, PlusCircle, Spline, Search, Trash2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onSummarize: () => void;
  onSuggestLinks: () => void;
  isSummarizing: boolean;
  isSuggesting: boolean;
}

const quickActionButtons = [
    {
      id: 'add',
      icon: <PlusCircle className="mr-2 h-4 w-4" />,
      text: 'Add Idea',
      message: 'Help me add a new idea to the graph.',
    },
    {
      id: 'link',
      icon: <Spline className="mr-2 h-4 w-4" />,
      text: 'Link Ideas',
      message: 'I want to link two ideas.',
    },
    {
      id: 'find',
      icon: <Search className="mr-2 h-4 w-4" />,
      text: 'Find Idea',
      message: 'Find the node about...',
    },
    {
      id: 'delete',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      text: 'Delete Idea',
      message: 'I want to delete a node named...',
    },
    {
      id: 'help',
      icon: <HelpCircle className="mr-2 h-4 w-4" />,
      text: 'Help',
      message: 'What can you do?',
    },
];

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
  onSummarize,
  onSuggestLinks,
  isSummarizing,
  isSuggesting,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isQuickActionLoading = isSummarizing || isSuggesting;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6" ref={viewportRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-xl rounded-lg p-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border'
                )}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
              {message.role === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
              <div className="max-w-md rounded-lg bg-muted p-3">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background shrink-0">
        <div className="grid grid-cols-2 gap-2 mb-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onSummarize}
                disabled={isLoading || isQuickActionLoading}
            >
                {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BrainCircuit className="mr-2 h-4 w-4"/>}
                Summarize
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onSuggestLinks}
                disabled={isLoading || isQuickActionLoading}
            >
                {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Link2 className="mr-2 h-4 w-4"/>}
                Suggest Links
            </Button>
        </div>
        <div className="relative w-full overflow-x-hidden whitespace-nowrap rounded-md group py-2">
            <div className="flex w-max animate-scroll group-hover:[animation-play-state:paused]">
                {[...quickActionButtons, ...quickActionButtons].map((action, i) => (
                    <Button
                        key={`${action.id}-${i}`}
                        variant="outline"
                        size="sm"
                        onClick={() => onSendMessage(action.message)}
                        disabled={isLoading || isQuickActionLoading}
                        className="shrink-0 mx-1"
                        aria-hidden={i >= quickActionButtons.length}
                    >
                        {action.icon}
                        {action.text}
                    </Button>
                ))}
            </div>
        </div>
        <div className="relative mt-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chat with your graph AI..."
            className="pr-12"
            rows={1}
            disabled={isLoading || isQuickActionLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || isQuickActionLoading || !input.trim()}
            size="icon"
            className="absolute bottom-1 right-1 h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
