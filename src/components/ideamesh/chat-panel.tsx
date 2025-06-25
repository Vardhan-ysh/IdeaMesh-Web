'use client';

import type { ChatMessage } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send, BrainCircuit, Link2, PlusCircle, Spline, Search, Trash2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatPanelProps {
  animationData: any;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onSummarize: () => void;
  onSuggestLinks: () => void;
  isSummarizing: boolean;
  isSuggesting: boolean;
  userAvatarUrl?: string | null;
  userDisplayName?: string | null;
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
  animationData,
  messages,
  onSendMessage,
  isLoading,
  onSummarize,
  onSuggestLinks,
  isSummarizing,
  isSuggesting,
  userAvatarUrl,
  userDisplayName,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8 px-4 text-muted-foreground">
              {animationData ? (
                <Lottie animationData={animationData} loop={true} style={{ width: 80, height: 80, margin: '0 auto', marginBottom: '1rem' }} />
              ) : (
                <Bot className="mx-auto h-12 w-12 mb-4 text-primary" />
              )}
              <h2 className="text-lg font-semibold text-foreground mb-2">Hello, I'm GraphAI!</h2>
              <p className="text-sm mb-6">
                I'm your intelligent assistant for this graph. You can ask me to:
              </p>
              <div className="text-sm text-left grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 max-w-sm mx-auto">
                <p className="flex items-start"><PlusCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80"/> Create nodes</p>
                <p className="flex items-start"><Spline className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80"/> Link ideas</p>
                <p className="flex items-start"><Trash2 className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80"/> Delete items</p>
                <p className="flex items-start"><Search className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80"/> Find info</p>
                <p className="flex items-start"><BrainCircuit className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80"/> Summarize</p>
                <p className="flex items-start"><Link2 className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/80"/> Suggest links</p>
              </div>
              <p className="text-sm mt-6">
                Try typing "Create a node about..." or use a quick action below.
              </p>
            </div>
          )}
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
                  {animationData ? (
                    <Lottie animationData={animationData} loop={true} style={{ width: 28, height: 28 }} />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
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
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={userAvatarUrl ?? undefined} />
                  <AvatarFallback>
                    {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  {animationData ? (
                    <Lottie animationData={animationData} loop={true} style={{ width: 28, height: 28 }} />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
              <div className="max-w-md rounded-lg bg-card border p-3">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-card shrink-0">
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
