export enum NotificationType {
  CREDITS_LOW = "CREDITS_LOW",
  NEW_FEATURE = "NEW_FEATURE",
  WEEKLY_SUMMARY = "WEEKLY_SUMMARY",
  COLLABORATION_INVITE = "COLLABORATION_INVITE",
  COLLABORATION_ACCEPTED = "COLLABORATION_ACCEPTED",
  COLLABORATION_REJECTED = "COLLABORATION_REJECTED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_INVITATION = "PROJECT_INVITATION"
}

export interface NotificationItemProps {
  id: string;
  type: NotificationType | string;
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
