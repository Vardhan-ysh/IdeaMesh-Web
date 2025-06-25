'use client';

import type { ChatMessage, ToolCall } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Loader2, Send, Wand2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onConfirmAction: (toolCall: ToolCall) => void;
  onDismissAction: (toolCall: ToolCall) => void;
  isLoading: boolean;
}

export default function ChatPanel({
  messages,
  onSendMessage,
  onConfirmAction,
  onDismissAction,
  isLoading,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="flex h-full flex-col bg-background">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
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
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-muted-foreground/20 pt-3">
                    {message.toolCalls.map((toolCall) => (
                      <Card key={toolCall.id} className="bg-card/50">
                        <CardHeader className="p-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Wand2 className="h-4 w-4 text-primary" />
                            Suggested Action
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {toolCall.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 text-xs">
                          <pre className="whitespace-pre-wrap rounded bg-muted p-2 font-mono text-xs">
                            {JSON.stringify(toolCall.args, null, 2)}
                          </pre>
                        </CardContent>
                        {!toolCall.isHandled && (
                          <CardFooter className="flex justify-end gap-2 p-3 pt-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDismissAction(toolCall)}
                            >
                              <X className="mr-1 h-4 w-4" /> Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onConfirmAction(toolCall)}
                            >
                              <Check className="mr-1 h-4 w-4" /> Apply
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))}
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
      <div className="border-t p-4 bg-background">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chat with your graph AI..."
            className="pr-16"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
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
