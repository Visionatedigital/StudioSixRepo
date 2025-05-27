'use client';

import React, { useEffect } from 'react';
import { Notification } from '@/types/notifications';
import { Check, X, Bell, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

const getPriorityIcon = (priority: Notification['priority']) => {
  switch (priority) {
    case 'success':
      return <Check className="w-5 h-5" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5" />;
    case 'error':
      return <X className="w-5 h-5" />;
    case 'info':
      return <Info className="w-5 h-5" />;
    case 'tip':
      return <Bell className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

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

export default function Toast({ notification, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center space-x-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out ${getPriorityColor(
        notification.priority
      )}`}
    >
      <div className="flex-shrink-0">{getPriorityIcon(notification.priority)}</div>
      <div className="flex-1">
        <h3 className="text-sm font-medium">{notification.title}</h3>
        <p className="mt-1 text-sm">{notification.message}</p>
        {notification.link && (
          <a
            href={notification.link}
            className="mt-2 inline-block text-sm font-medium hover:underline"
          >
            {notification.linkText || 'Learn more'}
          </a>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-full p-1 hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
} 