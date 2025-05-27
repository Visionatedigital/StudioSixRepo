'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationContextType, NotificationState } from '@/types/notifications';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'read' | 'createdAt'> }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        ...action.payload,
        id: uuidv4(),
        read: false,
        createdAt: new Date(),
      };
      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }
    case 'MARK_AS_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, read: true }
          : notification
      );
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    }
    case 'MARK_ALL_AS_READ': {
      return {
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0,
      };
    }
    case 'REMOVE_NOTIFICATION': {
      const notification = state.notifications.find(n => n.id === action.payload);
      return {
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: state.unreadCount - (notification?.read ? 0 : 1),
      };
    }
    case 'CLEAR_ALL': {
      return initialState;
    }
    default:
      return state;
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      parsed.notifications.forEach((notification: any) => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            ...notification,
            createdAt: new Date(notification.createdAt),
          },
        });
      });
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(state));
  }, [state]);

  const value = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    markAsRead: (id: string) => dispatch({ type: 'MARK_AS_READ', payload: id }),
    markAllAsRead: () => dispatch({ type: 'MARK_ALL_AS_READ' }),
    removeNotification: (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    clearAll: () => dispatch({ type: 'CLEAR_ALL' }),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 