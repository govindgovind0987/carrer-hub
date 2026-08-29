'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, ExternalLink, Sparkles, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from '@/actions/notifications';

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getNotificationsAction().then((res) => {
      if (!isMounted) return;
      if (res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    await markNotificationReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteNotificationAction(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent" aria-label="Notifications">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 overflow-hidden">
        <DropdownMenuLabel className="p-4 bg-muted/40 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] bg-violet-500/10 text-violet-600 font-semibold">
                {unreadCount} New
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-violet-600 hover:underline flex items-center gap-1 font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </DropdownMenuLabel>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <span>No notifications at this time</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 transition-colors flex items-start justify-between gap-3 ${
                  !n.isRead ? 'bg-violet-500/5' : 'hover:bg-accent/40'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-violet-600 inline-block" />}
                    <h5 className="font-bold text-xs text-foreground leading-tight">{n.title}</h5>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      className="text-[11px] font-semibold text-violet-600 hover:underline inline-flex items-center gap-1 pt-1"
                    >
                      View Details <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-emerald-600"
                      onClick={(e) => handleMarkRead(n.id, e)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-red-500"
                    onClick={(e) => handleDelete(n.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
