'use client';

import type { ChatMessage } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Loader2, Send, BrainCircuit, Link2, PlusCircle, Spline } from 'lucide-react';
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
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.toolCalls && message.toolCalls.length > 0 && !message.toolCalls[0].isHandled && (
                    <div className="mt-2 border-t pt-2 border-primary/50">
                        <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => {
                                // This is where you would call the handler to execute tool calls
                                console.log('Confirming tool calls', message.toolCalls);
                            }}>Confirm</Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                                // Logic to dismiss or ignore tool calls
                                console.log('Dismissing tool calls');
                            }}>Dismiss</Button>
                        </div>
                    </div>
                )}
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
            <Button
                variant="outline"
                size="sm"
                onClick={() => onSendMessage("Help me add a new idea to the graph.")}
                disabled={isLoading || isQuickActionLoading}
            >
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add Idea
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onSendMessage("I want to link two ideas.")}
                disabled={isLoading || isQuickActionLoading}
            >
                <Spline className="mr-2 h-4 w-4"/>
                Link Ideas
            </Button>
        </div>
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chat with your graph AI..."
            className="pr-16"
            rows={2}
            disabled={isLoading || isQuickActionLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || isQuickActionLoading || !input.trim()}
            size="icon"
            className="absolute bottom-2 right-2 h-10 w-10"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
