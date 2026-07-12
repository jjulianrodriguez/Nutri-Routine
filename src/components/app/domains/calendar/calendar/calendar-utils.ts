import type {
 CalendarArea,
 CalendarEventItem,
 CalendarFilters,
 CalendarPageData,
 CalendarProfessionalOption,
} from "@/lib/calendar/types";
import type { CalendarEventValues } from "@/lib/validations/calendar";

export const selectClasses =
 "mt-2 h-11 w-full min-w-0 rounded-control bg-surface px-4 py-2 text-base text-foreground transition-[background-color,border-color,box-shadow,color,transform] outline-none placeholder:text-muted-foreground ring-2 ring-primary/30 focus:bg-primary-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-danger/40 aria-invalid:bg-danger/10 md:text-sm dark:ring-primary/40 dark:focus:bg-primary-soft appearance-none";

export type CalendarDay = {
 dateKey: string;
 dayNumber: number;
 inMonth: boolean;
 isToday: boolean;
};

export const WEEKDAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function pad(value: number) {
 return String(value).padStart(2, "0");
}

export function toDateKey(date: Date) {
 return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
 date.getDate(),
 )}`;
}

function parseMonthKey(monthKey: string) {
 const [year, month] = monthKey.split("-").map(Number);

 return {
 monthIndex: month - 1,
 year,
 };
}

export function buildMonthDays(monthKey: string): CalendarDay[] {
 const { monthIndex, year } = parseMonthKey(monthKey);
 const firstDay = new Date(year, monthIndex, 1);
 const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
 const leadingDays = (firstDay.getDay() + 6) % 7;
 const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
 const start = new Date(year, monthIndex, 1 - leadingDays);
 const todayKey = toDateKey(new Date());

 return Array.from({ length: totalCells }, (_, index) => {
 const date = new Date(start);
 date.setDate(start.getDate() + index);
 const dateKey = toDateKey(date);

 return {
 dateKey,
 dayNumber: date.getDate(),
 inMonth: date.getMonth() === monthIndex,
 isToday: dateKey === todayKey,
 };
 });
}

export function formatMonthLabel(monthKey: string) {
 const { monthIndex, year } = parseMonthKey(monthKey);

 return new Intl.DateTimeFormat("es-CR", {
 month: "long",
 year: "numeric",
 }).format(new Date(year, monthIndex, 1));
}

export function formatFullDate(dateKey: string) {
 const [year, month, day] = dateKey.split("-").map(Number);

 return new Intl.DateTimeFormat("es-CR", {
 dateStyle: "full",
 }).format(new Date(year, month - 1, day));
}

export function formatShortDate(dateKey: string) {
 const [year, month, day] = dateKey.split("-").map(Number);

 return new Intl.DateTimeFormat("es-CR", {
 day: "numeric",
 month: "short",
 weekday: "short",
 }).format(new Date(year, month - 1, day));
}

export function formatMonthKeyFromDateKey(dateKey: string) {
 return dateKey.slice(0, 7);
}

export function eventToFormValues(
 event: CalendarEventItem,
): CalendarEventValues {
 return {
 area: event.area,
 clientId: event.clientId,
 date: event.dateKey,
 description: event.description ?? "",
 endTime: event.endTime ?? "",
 eventType: event.eventType,
 professionalId: event.professionalId,
 startTime: event.startTime,
 status: event.status,
 title: event.title,
 };
}

export function buildCalendarHref(
 filters: CalendarFilters,
 overrides: Partial<CalendarFilters> = {},
) {
 const next = { ...filters, ...overrides };
 const params = new URLSearchParams();

 params.set("month", next.month);

 if (next.clientId) {
 params.set("client", next.clientId);
 }

 if (next.professionalId) {
 params.set("professional", next.professionalId);
 }

 if (next.area !== "all") {
 params.set("area", next.area);
 }

 if (next.status !== "all") {
 params.set("status", next.status);
 }

 return `/app/calendario?${params.toString()}`;
}

export function defaultFormValues({
 data,
 date,
}: {
 data: CalendarPageData;
 date: string;
}): CalendarEventValues {
 const client = data.clientOptions[0];
 const area =
 data.manageableAreas.find((candidate) =>
 client?.availableAreas.includes(candidate),
 ) ??
 data.manageableAreas[0] ??
 "training";

 return {
 area,
 clientId: client?.id ?? "",
 date,
 description: "",
 endTime: "",
 eventType: "appointment",
 professionalId: data.isAdmin
 ? data.professionalOptions[0]?.id ?? ""
 : data.currentUserId,
 startTime: "09:00",
 status: "scheduled",
 title: "",
 };
}

export function professionalAllowsArea(
 professional: CalendarProfessionalOption,
 area: CalendarArea,
) {
 if (professional.specialty === "admin") {
 return true;
 }

 if (area === "general") {
 return professional.specialty === "both";
 }

 return professional.specialty === area || professional.specialty === "both";
}