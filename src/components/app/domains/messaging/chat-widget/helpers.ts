import { formatAppTime } from "@/lib/user-settings/time";
import type { TimeFormatPreference } from "@/lib/user-settings/types";
import type { ChatArea, ChatBootstrapResult, ChatConversationResult } from "@/lib/actions/chat";

export const CHAT_QUERY_KEY = ["chat"] as const;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const CHAT_LOADING_ROWS = [["w-36", "w-44"], ["w-44", "w-32"], ["w-32", "w-40"]] as const;
const CHAT_TIME_ZONE = "America/Costa_Rica";
const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("es-CR", { day: "2-digit", month: "short", timeZone: CHAT_TIME_ZONE, year: "numeric" });
const DAY_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "2-digit", timeZone: CHAT_TIME_ZONE, year: "numeric" });

export function isChatArea(value: string | null): value is ChatArea {
 return value === "nutrition" || value === "training";
}

export function getSuccessfulBootstrap(data: ChatBootstrapResult | undefined) {
 return data?.status === "success" ? data : null;
}

export function getSuccessfulConversation(data: ChatConversationResult | undefined) {
 return data?.status === "success" ? data.conversation : null;
}

function getDateParts(value: Date | string) {
 const parts = DAY_PARTS_FORMATTER.formatToParts(new Date(value));
 const partByType = new Map(parts.map((part) => [part.type, part.value]));
 return { day: partByType.get("day") ?? "01", month: partByType.get("month") ?? "01", year: partByType.get("year") ?? "1970" };
}

export function getDayKey(value: Date | string) {
 const parts = getDateParts(value);
 return `${parts.year}-${parts.month}-${parts.day}`;
}

function getUtcDay(parts: ReturnType<typeof getDateParts>) {
 return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
}

export function formatDaySeparator(value: string) {
 const messageParts = getDateParts(value);
 const todayParts = getDateParts(new Date());
 const diffDays = Math.round((getUtcDay(todayParts) - getUtcDay(messageParts)) / 86_400_000);
 if (diffDays === 0) return "Hoy";
 if (diffDays === 1) return "Ayer";
 return DAY_LABEL_FORMATTER.format(new Date(value)).replace(/\./g, "");
}

export function formatMessageTime(value: string, timeFormat: TimeFormatPreference) {
 return formatAppTime(value, timeFormat);
}

export function getChatInitials(name: string) {
 const parts = name.trim().split(/\s+/);
 if (parts.length === 0) return "?";
 if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
 return (parts[0][0] + parts[1][0]).toUpperCase();
}
