'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from './Icons';
import MessageInbox from './MessageInbox';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { NotificationType } from '@prisma/client';

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  project?: {
    id: string;
    name: string;
  };
  sender?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface MessageItemProps {
  userId: string;
  userName: string;
  userImage: string;
  lastMessage: string;
  time: Date;
  unreadCount: number;
  onSelect: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ id, type, read, createdAt, project, sender }) => {
  const getMessage = () => {
    switch (type) {
      case 'CREDITS_LOW':
        return `You have 10 credits remaining. Top up now to continue creating!`;
      case 'NEW_FEATURE':
        return 'Try our new AI-powered sketch enhancement tool!';
      case 'WEEKLY_SUMMARY':
        return `You've created 15 designs this week. Great work!`;
      case 'COLLABORATION_INVITE':
        return `${sender?.name || sender?.email} invited you to collaborate on ${project?.name}`;
      case 'COLLABORATION_ACCEPTED':
        return `${sender?.name || sender?.email} accepted your collaboration invite`;
      case 'COLLABORATION_REJECTED':
        return `${sender?.name || sender?.email} declined your collaboration invite`;
      case 'PROJECT_UPDATED':
        return `${sender?.name || sender?.email} updated ${project?.name}`;
      default:
        return 'New notification';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'CREDITS_LOW':
        return 'Credits Running Low';
      case 'NEW_FEATURE':
        return 'New Feature Available';
      case 'WEEKLY_SUMMARY':
        return 'Weekly Summary';
      case 'COLLABORATION_INVITE':
      case 'COLLABORATION_ACCEPTED':
      case 'COLLABORATION_REJECTED':
      case 'PROJECT_UPDATED':
        return 'Project Update';
      default:
        return 'Notification';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className={`p-4 hover:bg-gray-50 cursor-pointer ${!read ? 'bg-purple-50/50' : ''}`}>
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-sm font-medium text-[#202126]">{getTitle()}</h3>
        <span className="text-xs text-gray-500">{getTimeAgo(createdAt)}</span>
      </div>
      <p className="text-sm text-gray-600">{getMessage()}</p>
    </div>
  );
};

const MessageItem: React.FC<MessageItemProps> = ({ userName, userImage, lastMessage, time, unreadCount, onSelect }) => (
  <div className={`p-4 hover:bg-gray-50 cursor-pointer ${unreadCount > 0 ? 'bg-purple-50/50' : ''}`} onClick={onSelect}>
    <div className="flex gap-3">
      <div className="relative w-10 h-10">
        <Image 
          src={userImage} 
          alt={userName} 
          fill
          className="rounded-full object-cover" 
        />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-medium text-[#202126]">{userName}</h3>
          <span className="text-xs text-gray-500">{formatTime(time)}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{lastMessage}</p>
      </div>
    </div>
  </div>
);

// Helper function to format time
function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return new Date(date).toLocaleDateString();
}

export default function HeaderActions() {
  const { data: session } = useSession();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showMessageInbox, setShowMessageInbox] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    if (session?.user && isNotificationsOpen) {
      fetchNotifications();
    }
  }, [session, isNotificationsOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data.notifications);
      setTotalUnread(data.notifications.filter((n: NotificationItemProps) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(n => markAsRead(n.id))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
          setTotalUnread(data.conversations?.reduce((acc: number, conv: any) => acc + conv.unreadCount, 0) || 0);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (isMessagesOpen) {
      fetchConversations();
    }
  }, [isMessagesOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }

    if (isNotificationsOpen || isSearchExpanded || isMessagesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isNotificationsOpen, isSearchExpanded, isMessagesOpen]);

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    setShowMessageInbox(true);
    setIsMessagesOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Expandable Search Bar */}
        <div className="relative" ref={searchRef}>
          <div className={`flex items-center transition-all duration-300 ease-in-out ${
            isSearchExpanded 
              ? 'w-[300px] bg-white/95 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[#CDD0D5]' 
              : 'w-12'
          }`}>
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full"
            >
              <Icon name="searchbar" size={24} className={isSearchExpanded ? 'text-[#202126]' : ''} />
            </button>
            <input
              type="text"
              placeholder="Search..."
              className={`outline-none bg-transparent text-[#202126] text-sm placeholder:text-[#6C7275] w-full pr-4 ${
                isSearchExpanded ? 'opacity-100 ml-1' : 'opacity-0 w-0 p-0'
              } transition-all duration-300`}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full relative"
            onClick={(e) => {
              e.stopPropagation();
              setIsNotificationsOpen(!isNotificationsOpen);
            }}
          >
            <Icon name="notifications" size={24} />
            {totalUnread > 0 && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          <div 
            className={`absolute right-0 mt-2 w-[380px] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-200 ease-in-out ${
              isNotificationsOpen 
                ? 'opacity-100 translate-y-0 visible pointer-events-auto' 
                : 'opacity-0 -translate-y-2 invisible pointer-events-none'
            }`}
            style={{ zIndex: 9999 }}
          >
            <div className="sticky top-0 p-4 border-b border-gray-100 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="font-medium text-[#202126]">Notifications</h2>
                <button 
                  className="text-sm text-purple-600 hover:text-purple-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                >
                  Mark all as read
                </button>
              </div>
            </div>

            {/* Scrollable Notifications List */}
            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div key={notification.id} onClick={() => markAsRead(notification.id)}>
                      <NotificationItem {...notification} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* See More Footer */}
            <div className="sticky bottom-0 p-4 border-t border-gray-100 bg-gray-50">
              <Link 
                href="/notifications" 
                className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                onClick={() => setIsNotificationsOpen(false)}
              >
                See all notifications
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="relative" ref={messagesRef}>
          <button 
            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full relative"
            onClick={() => setIsMessagesOpen(!isMessagesOpen)}
          >
            <Icon name="message" size={24} />
            {totalUnread > 0 && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </button>
          
          {/* Messages Dropdown */}
          <div 
            className={`absolute right-0 mt-2 w-[380px] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-200 ease-in-out ${
              isMessagesOpen 
                ? 'opacity-100 translate-y-0 visible pointer-events-auto' 
                : 'opacity-0 -translate-y-2 invisible pointer-events-none'
            }`}
            style={{ zIndex: 9999 }}
          >
            <div className="sticky top-0 p-4 border-b border-gray-100 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="font-medium text-[#202126]">Messages</h2>
                <button 
                  className="text-sm text-purple-600 hover:text-purple-700"
                  onClick={() => {
                    setShowMessageInbox(true);
                    setIsMessagesOpen(false);
                  }}
                >
                  Mark all as read
                </button>
              </div>
            </div>

            {/* Scrollable Messages List */}
            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              <div className="divide-y divide-gray-100">
                {conversations.slice(0, 3).map((conversation) => (
                  <MessageItem
                    key={conversation.id}
                    userId={conversation.userId}
                    userName={conversation.userName}
                    userImage={conversation.userImage}
                    lastMessage={conversation.lastMessage}
                    time={new Date(conversation.updatedAt)}
                    unreadCount={conversation.unreadCount}
                    onSelect={() => handleSelectConversation(conversation)}
                  />
                ))}
              </div>
            </div>

            {/* Open Messages Footer */}
            <div className="sticky bottom-0 p-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => {
                  setShowMessageInbox(true);
                  setIsMessagesOpen(false);
                }}
                className="block w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Open Messages
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Message Inbox */}
      {showMessageInbox && (
        <MessageInbox 
          onClose={() => {
            setShowMessageInbox(false);
            setSelectedConversation(null);
          }} 
          initialConversation={selectedConversation}
        />
      )}
    </>
  );
} 