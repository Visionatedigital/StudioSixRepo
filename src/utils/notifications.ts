import { Notification } from '@/types/notifications';

export const createDesignSuggestion = (message: string, link?: string): Omit<Notification, 'id' | 'read' | 'createdAt'> => ({
  title: 'Design Suggestion',
  message,
  priority: 'tip',
  category: 'design_suggestion',
  link,
  linkText: 'Try it now',
});

export const createSystemUpdate = (message: string, priority: Notification['priority'] = 'info'): Omit<Notification, 'id' | 'read' | 'createdAt'> => ({
  title: 'System Update',
  message,
  priority,
  category: 'system_update',
});

export const createCollaborationNotification = (
  userName: string,
  action: string,
  link?: string
): Omit<Notification, 'id' | 'read' | 'createdAt'> => ({
  title: 'Collaboration',
  message: `${userName} ${action}`,
  priority: 'info',
  category: 'collaboration',
  link,
  linkText: 'View details',
});

export const createErrorNotification = (message: string, link?: string): Omit<Notification, 'id' | 'read' | 'createdAt'> => ({
  title: 'Error',
  message,
  priority: 'error',
  category: 'error',
  link,
  linkText: 'Learn more',
});

export const createWarningNotification = (message: string, link?: string): Omit<Notification, 'id' | 'read' | 'createdAt'> => ({
  title: 'Warning',
  message,
  priority: 'warning',
  category: 'warning',
  link,
  linkText: 'Learn more',
});

export const createSuccessNotification = (message: string, link?: string): Omit<Notification, 'id' | 'read' | 'createdAt'> => ({
  title: 'Success',
  message,
  priority: 'success',
  category: 'success',
  link,
  linkText: 'View details',
});

export const createMarketingNotification = (title: string, message: string, link?: string): Omit<Notification, 'id' | 'read' | 'createdAt'> => ({
  title,
  message,
  priority: 'info',
  category: 'marketing',
  link,
  linkText: 'Learn more',
}); 