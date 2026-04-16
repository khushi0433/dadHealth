import type { NotificationType } from "@/types/database";

export type NotificationLink =
  | "/"
  | "/bond"
  | "/fitness"
  | "/progress"
  | "/mind";

export type NotificationPayload = {
  type: NotificationType;
  heading: string;
  content: string;
  link: NotificationLink;
};

