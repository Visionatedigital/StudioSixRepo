'use client';

import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationsPage() {
  const { notifications, markAsRead, removeNotification } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="text-gray-500">No notifications yet.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li key={n.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-gray-600">{n.message}</div>
              </div>
              <div className="flex gap-2">
                {!n.read && (
                  <button onClick={() => markAsRead(n.id)} className="text-purple-600 text-xs">Mark as read</button>
                )}
                <button onClick={() => removeNotification(n.id)} className="text-red-500 text-xs">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 