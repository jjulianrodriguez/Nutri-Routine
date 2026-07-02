import type { Enums } from "@/types/database";
import type { TimeFormatPreference } from "@/lib/user-settings/types";

export type CalendarArea = Enums<"service_area">;
export type CalendarEventType = Enums<"appointment_event_type">;
export type CalendarStatus = Enums<"appointment_status">;

export type CalendarClientOption = {
 availableAreas: CalendarArea[];
 email: string | null;
 fullName: string;
 id: string;
 serviceSummary: string;
};

export type CalendarProfessionalOption = {
 fullName: string;
 id: string;
 specialty: Enums<"professional_specialty"> | "admin";
};

export type CalendarEventItem = {
 area: CalendarArea;
 clientEmail: string | null;
 clientId: string;
 clientName: string;
 createdBy: string | null;
 dateKey: string;
 description: string | null;
 endsAt: string | null;
 endTime: string | null;
 eventType: CalendarEventType;
 id: string;
 professionalId: string;
 professionalName: string;
 startsAt: string;
 startTime: string;
 status: CalendarStatus;
 title: string;
};

export type CalendarFilters = {
 area: CalendarArea | "all";
 clientId: string;
 month: string;
 professionalId: string;
 status: CalendarStatus | "all";
};

export type CalendarPageData = {
 canFilter: boolean;
 canManageEvents: boolean;
 clientOptions: CalendarClientOption[];
 currentUserId: string;
 defaultSelectedDate: string;
 error: string | null;
 eventMonthKeys: string[];
 events: CalendarEventItem[];
 filters: CalendarFilters;
 isAdmin: boolean;
 manageableAreas: CalendarArea[];
 monthKey: string;
 nextMonthKey: string;
 previousMonthKey: string;
 professionalOptions: CalendarProfessionalOption[];
 timeFormat: TimeFormatPreference;
 upcomingEvents: CalendarEventItem[];
};
