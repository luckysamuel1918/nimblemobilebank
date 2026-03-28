
import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from '@/hooks/use-toast';
import ChatModal from './ChatModal';
import { formatCurrency } from '@/utils/currency';

interface NotificationBellProps {
  className?: string;
}

interface Activity {
  id: string;
  type: 'transfer' | 'deposit' | 'message' | 'account';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

const NotificationBell = ({ className }: NotificationBellProps) => {
  const { currentUser, userData, isAdmin } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Request notification permission on component mount with feature detection
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for user transactions and activities
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    // Listen for support messages
    const supportMessagesQuery = query(
      collection(db, 'supportChats'),
      where('userId', '==', currentUser.uid),
      where('sender', '==', isAdmin ? 'user' : 'support'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    // Listen to transactions
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (querySnapshot) => {
      const transactionActivities: Activity[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type === 'deposit' ? 'deposit' : 'transfer',
          title: data.type === 'deposit' ? 'Deposit Completed' : 'Transfer Completed',
          description: `${data.type === 'deposit' ? 'Deposited' : 'Transferred'} ${formatCurrency(data.amount, userData)}`,
          timestamp: data.createdAt?.toDate() || new Date(),
          read: false
        };
      });

      // Listen to support messages
      const unsubscribeMessages = onSnapshot(supportMessagesQuery, (messageSnapshot) => {
        const messageActivities: Activity[] = messageSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: `msg_${doc.id}`,
            type: 'message',
            title: `New message from ${isAdmin ? 'User' : 'Support'}`,
            description: data.text?.substring(0, 50) + '...' || 'New message received',
            timestamp: data.timestamp?.toDate() || new Date(),
            read: data.read || false
          };
        });

        // Show notifications for new unread messages
        const newUnreadMessages = messageActivities.filter(msg => !msg.read);
        newUnreadMessages.forEach(msg => {
          if (activities.length > 0) { // Only show after initial load
            // Browser notification with feature detection
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(msg.title, {
                body: msg.description,
                icon: '/favicon.ico'
              });
            }
            
            // Toast notification
            toast({
              title: msg.title,
              description: msg.description,
            });
          }
        });

        // Combine and sort activities
        const allActivities = [...transactionActivities, ...messageActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        setActivities(allActivities);
        setUnreadCount(allActivities.filter(activity => !activity.read).length);
      });

      return () => unsubscribeMessages();
    });

    return () => unsubscribeTransactions();
  }, [currentUser, isAdmin]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    // Mark notifications as read when opened
    if (!showNotifications) {
      setActivities(prev => prev.map(activity => ({ ...activity, read: true })));
      setUnreadCount(0);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Chat Support Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowChat(true)}
          className="text-gray-500 hover:text-gray-700"
          title="Support Chat"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>

        {/* Notification Bell */}
        <Popover open={showNotifications} onOpenChange={setShowNotifications}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNotificationClick}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Account Activities</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No recent activities
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className={`p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                          !activity.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground mb-1">
                              {activity.title}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                          {!activity.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      <ChatModal 
        isOpen={showChat} 
        onClose={() => setShowChat(false)}
      />
    </>
  );
};

export default NotificationBell;
