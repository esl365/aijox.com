import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Paperclip, MoreVertical } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conversation',
  description: 'Message thread',
};

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/messages/${params.id}`);
  }

  const conversation = {
    id: params.id,
    school: 'Seoul International Academy',
    recruiter: 'Sarah Kim',
    recruiterRole: 'HR Manager',
    avatar: 'SK',
    messages: [
      {
        id: 1,
        sender: 'recruiter',
        text: 'Hello! Thank you for applying to the ESL Teacher position at Seoul International Academy.',
        timestamp: '2025-01-19T10:00:00Z',
      },
      {
        id: 2,
        sender: 'me',
        text: 'Thank you for reaching out! I am very excited about this opportunity.',
        timestamp: '2025-01-19T10:15:00Z',
      },
      {
        id: 3,
        sender: 'recruiter',
        text: 'Great! We reviewed your profile and video resume. We were impressed by your teaching experience and enthusiasm.',
        timestamp: '2025-01-19T11:30:00Z',
      },
      {
        id: 4,
        sender: 'me',
        text: 'I appreciate that! I have always wanted to teach at an international school in Seoul.',
        timestamp: '2025-01-19T11:45:00Z',
      },
      {
        id: 5,
        sender: 'recruiter',
        text: 'We would like to schedule a video interview with you. Would you be available next week?',
        timestamp: '2025-01-20T09:00:00Z',
      },
      {
        id: 6,
        sender: 'me',
        text: 'Yes, I am available next week. What day and time work best for you?',
        timestamp: '2025-01-20T09:30:00Z',
      },
      {
        id: 7,
        sender: 'recruiter',
        text: 'Thank you for your application. We would like to schedule an interview.',
        timestamp: '2025-01-20T11:30:00Z',
      },
    ],
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = Math.floor((today.getTime() - messageDate.getTime()) / 86400000);

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/messages">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {conversation.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold">{conversation.school}</h1>
                <p className="text-sm text-muted-foreground">{conversation.recruiter} • {conversation.recruiterRole}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="space-y-4 mb-6">
          {conversation.messages.map((message, index) => {
            const showTimestamp = index === 0 ||
              new Date(conversation.messages[index - 1].timestamp).getTime() -
              new Date(message.timestamp).getTime() > 3600000;

            return (
              <div key={message.id}>
                {showTimestamp && (
                  <div className="text-center mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {formatTimestamp(message.timestamp)}
                    </Badge>
                  </div>
                )}
                <div className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[70%] ${
                    message.sender === 'me' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {message.sender !== 'me' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {conversation.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Card className={`${
                      message.sender === 'me'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white'
                    }`}>
                      <CardContent className="p-3">
                        <p className="text-sm">{message.text}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              type="text"
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom padding for fixed input */}
      <div className="h-20"></div>
    </div>
  );
}
