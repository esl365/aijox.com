'use client';

import { useState, useTransition, ReactElement } from 'react';
import { Alert as PrismaAlert, AlertType, AlertCategory } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Calendar,
  Users,
  Briefcase,
  Clock,
  Info,
  X,
  Check,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { markAlertAsRead, deleteAlert, markAllAlertsAsRead } from '@/app/actions/alerts';
import { useRouter } from 'next/navigation';

interface SmartAlertsWidgetProps {
  alerts: PrismaAlert[];
  unreadCount: number;
}

export function SmartAlertsWidget({ alerts: initialAlerts, unreadCount: initialUnreadCount }: SmartAlertsWidgetProps) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMarkAsRead = async (alertId: string) => {
    startTransition(async () => {
      try {
        await markAlertAsRead(alertId);
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, read: true } : a));
        setUnreadCount(Math.max(0, unreadCount - 1));
        router.refresh();
      } catch (error) {
        console.error('Failed to mark alert as read:', error);
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      try {
        await markAllAlertsAsRead();
        setAlerts(alerts.map(a => ({ ...a, read: true })));
        setUnreadCount(0);
        router.refresh();
      } catch (error) {
        console.error('Failed to mark all alerts as read:', error);
      }
    });
  };

  const handleDelete = async (alertId: string) => {
    startTransition(async () => {
      try {
        const alert = alerts.find(a => a.id === alertId);
        await deleteAlert(alertId);
        setAlerts(alerts.filter(a => a.id !== alertId));
        if (alert && !alert.read) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
        router.refresh();
      } catch (error) {
        console.error('Failed to delete alert:', error);
      }
    });
  };

  const getAlertIcon = (category: AlertCategory) => {
    switch (category) {
      case 'APPLICATION':
        return <Users className="h-4 w-4" />;
      case 'INTERVIEW':
        return <Calendar className="h-4 w-4" />;
      case 'JOB':
        return <Briefcase className="h-4 w-4" />;
      case 'DEADLINE':
        return <Clock className="h-4 w-4" />;
      case 'SYSTEM':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: AlertType) => {
    switch (type) {
      case 'URGENT':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'TODAY':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'THIS_WEEK':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'INFO':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      default:
        return 'border-gray-300';
    }
  };

  const getBadgeVariant = (type: AlertType): 'default' | 'secondary' | 'destructive' => {
    switch (type) {
      case 'URGENT':
        return 'destructive';
      case 'TODAY':
      case 'THIS_WEEK':
        return 'default';
      case 'INFO':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const urgentAlerts = alerts.filter(a => a.type === 'URGENT' && !a.read);
  const todayAlerts = alerts.filter(a => a.type === 'TODAY' && !a.read);
  const otherAlerts = alerts.filter(a => (a.type === 'THIS_WEEK' || a.type === 'INFO') && !a.read);
  const readAlerts = alerts.filter(a => a.read).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-xl">Smart Alerts</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Urgent Alerts */}
          {urgentAlerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Urgent ({urgentAlerts.length})
              </h4>
              {urgentAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  getAlertIcon={getAlertIcon}
                  getAlertColor={getAlertColor}
                  getBadgeVariant={getBadgeVariant}
                  isPending={isPending}
                />
              ))}
            </div>
          )}

          {/* Today Alerts */}
          {todayAlerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-orange-600 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Today ({todayAlerts.length})
              </h4>
              {todayAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  getAlertIcon={getAlertIcon}
                  getAlertColor={getAlertColor}
                  getBadgeVariant={getBadgeVariant}
                  isPending={isPending}
                />
              ))}
            </div>
          )}

          {/* Other Unread Alerts */}
          {otherAlerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                <Info className="h-4 w-4" />
                Other ({otherAlerts.length})
              </h4>
              {otherAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  getAlertIcon={getAlertIcon}
                  getAlertColor={getAlertColor}
                  getBadgeVariant={getBadgeVariant}
                  isPending={isPending}
                />
              ))}
            </div>
          )}

          {/* Read Alerts */}
          {readAlerts.length > 0 && unreadCount === 0 && (
            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-sm font-semibold text-gray-400">Recent</h4>
              {readAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  getAlertIcon={getAlertIcon}
                  getAlertColor={getAlertColor}
                  getBadgeVariant={getBadgeVariant}
                  isPending={isPending}
                />
              ))}
            </div>
          )}

          {alerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts at this time</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertItemProps {
  alert: PrismaAlert;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getAlertIcon: (category: AlertCategory) => ReactElement;
  getAlertColor: (type: AlertType) => string;
  getBadgeVariant: (type: AlertType) => 'default' | 'secondary' | 'destructive';
  isPending: boolean;
}

function AlertItem({
  alert,
  onMarkAsRead,
  onDelete,
  getAlertIcon,
  getAlertColor,
  getBadgeVariant,
  isPending
}: AlertItemProps) {
  return (
    <div
      className={`border-l-4 rounded-lg p-3 ${getAlertColor(alert.type)} ${
        alert.read ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="mt-0.5">{getAlertIcon(alert.category)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-semibold text-sm truncate">{alert.title}</h5>
              <Badge variant={getBadgeVariant(alert.type)} className="text-xs shrink-0">
                {alert.type}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
              {alert.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {alert.actionHref && alert.actionLabel && (
                <Link href={alert.actionHref}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    {alert.actionLabel}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
              <span className="text-xs text-gray-500">
                {new Date(alert.createdAt).toLocaleDateString()} {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!alert.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onMarkAsRead(alert.id)}
              disabled={isPending}
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={() => onDelete(alert.id)}
            disabled={isPending}
            title="Delete"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
