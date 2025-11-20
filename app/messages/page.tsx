import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Messages',
  description: 'Your conversations with schools and recruiters',
};

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/messages');
  }

  const conversations = [
    {
      id: '1',
      school: 'Seoul International Academy',
      recruiter: 'Sarah Kim',
      lastMessage: 'Thank you for your application. We would like to schedule an interview.',
      timestamp: '2025-01-20T11:30:00Z',
      unread: true,
      avatar: 'SK',
    },
    {
      id: '2',
      school: 'Tokyo International School',
      recruiter: 'Yuki Tanaka',
      lastMessage: 'Great! Looking forward to our interview next week.',
      timestamp: '2025-01-19T16:45:00Z',
      unread: false,
      avatar: 'YT',
    },
    {
      id: '3',
      school: 'Singapore American School',
      recruiter: 'Michael Chen',
      lastMessage: 'Your profile looks impressive. Do you have any questions about the position?',
      timestamp: '2025-01-19T14:20:00Z',
      unread: true,
      avatar: 'MC',
    },
    {
      id: '4',
      school: 'British International School Bangkok',
      recruiter: 'Emma Thompson',
      lastMessage: 'Thank you for reaching out. The position has been filled.',
      timestamp: '2025-01-18T10:15:00Z',
      unread: false,
      avatar: 'ET',
    },
    {
      id: '5',
      school: 'Dubai International Academy',
      recruiter: 'Ahmed Hassan',
      lastMessage: 'We received your documents. Our team will review them shortly.',
      timestamp: '2025-01-17T09:00:00Z',
      unread: false,
      avatar: 'AH',
    },
  ];

  const unreadCount = conversations.filter(c => c.unread).length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with schools and recruiters
            {unreadCount > 0 && (
              <span className="ml-2">
                • <strong>{unreadCount}</strong> unread
              </span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>

        {/* Conversations List */}
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Link key={conversation.id} href={`/messages/${conversation.id}`}>
              <Card className={`transition-all hover:shadow-md cursor-pointer ${
                conversation.unread ? 'border-blue-300 bg-blue-50/30' : ''
              }`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {conversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{conversation.school}</h3>
                        {conversation.unread && (
                          <Badge variant="default" className="h-5 px-2 shrink-0">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {conversation.recruiter}
                      </p>
                      <p className={`text-sm line-clamp-1 ${
                        conversation.unread ? 'font-medium text-foreground' : 'text-muted-foreground'
                      }`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {formatTimestamp(conversation.timestamp)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {conversations.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground mb-6">
                Start applying to jobs to connect with schools and recruiters
              </p>
              <Link href="/jobs">
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Browse Jobs
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
