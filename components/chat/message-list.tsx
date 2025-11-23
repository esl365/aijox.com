'use client';

import { useEffect, useRef } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * Chat Message List - Phase 2 Task 3.1
 */

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto flex-1">
      {messages.map((message) => {
        const isOwn = message.isCurrentUser;

        return (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              isOwn ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <div className="bg-primary text-primary-foreground flex items-center justify-center h-full text-sm">
                {message.senderName[0]}
              </div>
            </Avatar>

            <div
              className={cn(
                'flex flex-col max-w-[70%]',
                isOwn ? 'items-end' : 'items-start'
              )}
            >
              <span className="text-xs text-muted-foreground mb-1">
                {message.senderName}
              </span>
              <div
                className={cn(
                  'rounded-lg px-4 py-2',
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {message.timestamp}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
