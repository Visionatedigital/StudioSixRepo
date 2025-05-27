'use client';

import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Bell } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const getPriorityColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'success':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'warning':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'error':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'info':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'tip':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getPriorityIcon = (priority: Notification['priority']) => {
  switch (priority) {
    case 'success':
      return <Check className="w-5 h-5" />;
    case 'warning':
      return <Bell className="w-5 h-5" />;
    case 'error':
      return <X className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[400px] bg-white shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-4rem)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 transition-colors ${
                    !notification.read ? 'bg-purple-50/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 rounded-full p-1 ${getPriorityColor(notification.priority)}`}>
                      {getPriorityIcon(notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="ml-2 rounded-full p-1 hover:bg-gray-100"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="mt-2 inline-block text-sm text-purple-600 hover:text-purple-700"
                        >
                          {notification.linkText || 'Learn more'}
                        </a>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="absolute right-4 top-4 text-xs text-purple-600 hover:text-purple-700"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 