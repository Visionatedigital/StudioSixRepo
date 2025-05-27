export type NotificationPriority = 'success' | 'warning' | 'error' | 'info' | 'tip';

export type NotificationCategory = 
  | 'design_suggestion'
  | 'system_update'
  | 'collaboration'
  | 'marketing'
  | 'error'
  | 'warning'
  | 'success';

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  read: boolean;
  createdAt: Date;
  link?: string;
  linkText?: string;
  icon?: string;
  data?: Record<string, any>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
} 