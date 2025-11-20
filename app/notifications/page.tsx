import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bell, BriefcaseIcon, MessageCircle, Star, CheckCheck, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View your notifications and updates',
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/notifications');
  }

  const notifications = [
    {
      id: 1,
      type: 'job_match',
      title: 'New Job Match',
      message: 'ESL Teacher position at Seoul International Academy matches your preferences',
      read: false,
      timestamp: '2025-01-20T10:30:00Z',
      link: '/jobs/1',
      icon: BriefcaseIcon,
    },
    {
      id: 2,
      type: 'application',
      title: 'Application Update',
      message: 'Your application for Math Teacher has been shortlisted',
      read: false,
      timestamp: '2025-01-20T09:15:00Z',
      link: '/applications/2',
      icon: Star,
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Tokyo International School sent you a message',
      read: true,
      timestamp: '2025-01-19T16:45:00Z',
      link: '/messages/3',
      icon: MessageCircle,
    },
    {
      id: 4,
      type: 'job_match',
      title: 'New Job Match',
      message: 'Science Teacher position in Singapore matches your criteria',
      read: true,
      timestamp: '2025-01-19T14:20:00Z',
      link: '/jobs/4',
      icon: BriefcaseIcon,
    },
    {
      id: 5,
      type: 'application',
      title: 'Application Received',
      message: 'Your application for Physics Teacher has been received',
      read: true,
      timestamp: '2025-01-18T11:00:00Z',
      link: '/applications/5',
      icon: CheckCheck,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;
  const jobMatchCount = notifications.filter(n => n.type === 'job_match').length;
  const applicationCount = notifications.filter(n => n.type === 'application').length;
  const messageCount = notifications.filter(n => n.type === 'message').length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with job matches, applications, and messages
            </p>
          </div>
          <Link href="/settings/notifications">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {unreadCount > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-600" />
                <p className="font-medium text-blue-900">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="job_match">
              Jobs ({jobMatchCount})
            </TabsTrigger>
            <TabsTrigger value="application">
              Applications ({applicationCount})
            </TabsTrigger>
            <TabsTrigger value="message">
              Messages ({messageCount})
            </TabsTrigger>
          </TabsList>

          {/* All Notifications */}
          <TabsContent value="all" className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Link key={notification.id} href={notification.link}>
                  <Card className={`transition-all hover:shadow-md ${
                    !notification.read ? 'border-blue-300 bg-blue-50/50' : ''
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'job_match' ? 'bg-green-100' :
                          notification.type === 'application' ? 'bg-blue-100' :
                          'bg-purple-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            notification.type === 'job_match' ? 'text-green-600' :
                            notification.type === 'application' ? 'text-blue-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{notification.title}</h3>
                            {!notification.read && (
                              <Badge variant="default" className="h-5 px-2">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </TabsContent>

          {/* Job Match Notifications */}
          <TabsContent value="job_match" className="space-y-3">
            {notifications
              .filter(n => n.type === 'job_match')
              .map((notification) => {
                const Icon = notification.icon;
                return (
                  <Link key={notification.id} href={notification.link}>
                    <Card className={`transition-all hover:shadow-md ${
                      !notification.read ? 'border-blue-300 bg-blue-50/50' : ''
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-green-100">
                            <Icon className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{notification.title}</h3>
                              {!notification.read && (
                                <Badge variant="default" className="h-5 px-2">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </TabsContent>

          {/* Application Notifications */}
          <TabsContent value="application" className="space-y-3">
            {notifications
              .filter(n => n.type === 'application')
              .map((notification) => {
                const Icon = notification.icon;
                return (
                  <Link key={notification.id} href={notification.link}>
                    <Card className={`transition-all hover:shadow-md ${
                      !notification.read ? 'border-blue-300 bg-blue-50/50' : ''
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{notification.title}</h3>
                              {!notification.read && (
                                <Badge variant="default" className="h-5 px-2">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </TabsContent>

          {/* Message Notifications */}
          <TabsContent value="message" className="space-y-3">
            {notifications
              .filter(n => n.type === 'message')
              .map((notification) => {
                const Icon = notification.icon;
                return (
                  <Link key={notification.id} href={notification.link}>
                    <Card className={`transition-all hover:shadow-md ${
                      !notification.read ? 'border-blue-300 bg-blue-50/50' : ''
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-purple-100">
                            <Icon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{notification.title}</h3>
                              {!notification.read && (
                                <Badge variant="default" className="h-5 px-2">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                When you receive notifications, they will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
