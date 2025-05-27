'use client';

import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import Toast from './Toast';

export default function ToastContainer() {
  const { notifications } = useNotifications();

  // Only show the 3 most recent notifications as toasts
  const recentNotifications = notifications
    .filter(notification => !notification.read)
    .slice(0, 3);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-4">
      {recentNotifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => {}}
        />
      ))}
    </div>
  );
} 