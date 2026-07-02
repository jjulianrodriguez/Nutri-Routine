import type { Enums } from "@/types/database";

export const CALENDAR_EVENT_TYPES = [
 "appointment",
 "follow_up",
 "reminder",
 "review",
 "progress_check",
 "consultation",
 "other",
] as const;

export const CALENDAR_AREAS = ["training", "nutrition", "general"] as const;

export const CALENDAR_STATUSES = [
 "scheduled",
 "completed",
 "cancelled",
] as const;

export const EVENT_TYPE_LABELS: Record<
 Enums<"appointment_event_type">,
 string
> = {
 appointment: "Cita",
 consultation: "Consulta",
 follow_up: "Seguimiento",
 other: "Otro",
 progress_check: "Control de progreso",
 reminder: "Recordatorio",
 review: "Revision",
};

export const AREA_LABELS: Record<Enums<"service_area">, string> = {
 general: "Ambas",
 nutrition: "Nutrición",
 training: "Entrenamiento",
};

export const STATUS_LABELS: Record<Enums<"appointment_status">, string> = {
 cancelled: "Cancelado",
 completed: "Completado",
 scheduled: "Programado",
};

export const STATUS_DESCRIPTIONS: Record<Enums<"appointment_status">, string> = {
 cancelled: "La cita fue anulada y queda guardada como referencia.",
 completed: "La consulta o seguimiento ya fue atendido.",
 scheduled: "La cita, consulta o recordatorio sigue activo.",
};

export const TIME_ZONE = "America/Costa_Rica";
