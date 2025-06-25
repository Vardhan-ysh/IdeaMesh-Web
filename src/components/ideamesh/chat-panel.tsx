'use client';

import type { ChatMessage } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send, BrainCircuit, Link2, PlusCircle, Spline, Search, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      icon: <PlusCircle className="h-5 w-5" />,
      text: 'Add Idea',
      message: 'Help me add a new idea to the graph.',
    },
    {
      id: 'link',
      icon: <Spline className="h-5 w-5" />,
      text: 'Link Ideas',
      message: 'I want to link two ideas.',
    },
    {
      id: 'find',
      icon: <Search className="h-5 w-5" />,
      text: 'Find Idea',
      message: 'Find the node about...',
    },
    {
      id: 'help',
      icon: <HelpCircle className="h-5 w-5" />,
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
    <div className="flex flex-1 flex-col overflow-hidden bg-background/0">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6" ref={viewportRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3 animate-fade-in-up',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-border/30">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20">
                     {animationData ? (
                        <Lottie animationData={animationData} loop={true} style={{ width: 28, height: 28 }} />
                      ) : (
                        <Bot className="h-5 w-5 text-primary" />
                      )}
                  </div>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xl rounded-2xl p-3 prose prose-sm shadow-md',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-card/80 border border-border/20 rounded-bl-none'
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
            <div className="flex items-start gap-3 justify-start animate-fade-in-up">
               <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-border/30">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20">
                     {animationData ? (
                        <Lottie animationData={animationData} loop={true} style={{ width: 28, height: 28 }} />
                      ) : (
                        <Bot className="h-5 w-5 text-primary" />
                      )}
                  </div>
                </Avatar>
              <div className="max-w-md rounded-2xl rounded-bl-none bg-card/80 border border-border/20 p-3 shadow-md">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8 px-4 text-muted-foreground animate-fade-in-up">
              {animationData ? (
                <Lottie animationData={animationData} loop={true} style={{ width: 100, height: 100, margin: '0 auto', marginBottom: '1rem' }} />
              ) : (
                <Bot className="mx-auto h-12 w-12 mb-4 text-primary" />
              )}
              <h2 className="text-lg font-semibold text-foreground mb-2">Hello, I'm GraphAI!</h2>
              <p className="text-sm mb-6 max-w-sm mx-auto">
                I'm your intelligent assistant for this graph. Try asking me to do something, or use a quick action below.
              </p>
               <div className="flex justify-center gap-2 mb-6">
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={onSummarize}
                    disabled={isQuickActionLoading}
                >
                    {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BrainCircuit className="mr-2 h-4 w-4"/>}
                    Summarize
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSuggestLinks}
                    disabled={isQuickActionLoading}
                >
                    {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Link2 className="mr-2 h-4 w-4"/>}
                    Suggest Links
                </Button>
               </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-border/20 p-4 bg-card/60 backdrop-blur-sm shrink-0">
        <div className="flex justify-center gap-2 mb-3">
          <TooltipProvider>
            {quickActionButtons.map((action) => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onSendMessage(action.message)}
                    disabled={isLoading || isQuickActionLoading}
                    className="h-9 w-9"
                  >
                    {action.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.text}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <div className="relative">
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
            className="absolute bottom-1.5 right-1.5 h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

    