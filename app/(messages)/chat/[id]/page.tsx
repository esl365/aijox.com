'use client';

import { useState, use } from 'react';
import { MessageList, Message } from '@/components/chat/message-list';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

/**
 * Chat Page - Phase 2 Task 3.1
 * 1:1 messaging between recruiter and candidate
 */

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '2',
      senderName: 'Recruiter',
      content: 'Hi! Thanks for applying to our ESL Teacher position.',
      timestamp: '10:30 AM',
      isCurrentUser: false,
    },
    {
      id: '2',
      senderId: '1',
      senderName: 'You',
      content: "Thank you! I'm very interested in this opportunity.",
      timestamp: '10:32 AM',
      isCurrentUser: true,
    },
    {
      id: '3',
      senderId: '2',
      senderName: 'Recruiter',
      content: 'Great! Would you be available for an interview next week?',
      timestamp: '10:35 AM',
      isCurrentUser: false,
    },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: '1',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      isCurrentUser: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl h-[calc(100vh-4rem)]">
      <Card className="flex flex-col h-full">
        <div className="border-b p-4">
          <h2 className="font-semibold">Chat with Recruiter</h2>
          <p className="text-sm text-muted-foreground">Conversation ID: {id}</p>
        </div>

        <MessageList messages={messages} currentUserId="1" />

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
