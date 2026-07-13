import type { LucideIcon } from "lucide-react";

export type EventPresentation = { icon: LucideIcon; label: string };
export type NotificationViewer = "client" | "professional";
export type NotificationCategory = "nutrition" | "training" | "resources" | "calendar" | "messages" | "general";
export type NotificationFilter = "all" | "unread" | NotificationCategory;
export type NotificationTab = { count: number; id: NotificationFilter; label: string };
