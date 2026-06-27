export type HabitWeekDay = {
  date: string;
  dayNumber: number;
  isToday: boolean;
  label: string;
  shortLabel: string;
};

export type HabitSummary = {
  active: boolean;
  createdBy: string;
  description: string | null;
  id: string;
  title: string;
};

export type HabitClientOption = {
  assignedNutritionistId: string | null;
  fullName: string;
  id: string;
};

export type HabitProgressCell = {
  completed: boolean;
  completedAt: string | null;
  id: string | null;
};

export type HabitAssignmentSummary = {
  active: boolean;
  assignedBy: string;
  clientId: string;
  daysOfWeek: number[];
  endDate: string | null;
  habit: HabitSummary;
  id: string;
  progressByDate: Record<string, HabitProgressCell>;
  startDate: string;
};

export type HabitWeekStats = {
  completed: number;
  markedDays: number;
  pending: number;
  percentage: number;
  total: number;
};

export type NutritionHabitTrackerData = {
  assignments: HabitAssignmentSummary[];
  canManage: boolean;
  clients: HabitClientOption[];
  currentUserId: string;
  habits: HabitSummary[];
  selectedClient: HabitClientOption | null;
  stats: HabitWeekStats;
  today: string;
  weekDays: HabitWeekDay[];
  weekEnd: string;
  weekStart: string;
};

const WEEKDAY_LABELS = [
  { label: "Lunes", shortLabel: "Lun" },
  { label: "Martes", shortLabel: "Mar" },
  { label: "Miercoles", shortLabel: "Mie" },
  { label: "Jueves", shortLabel: "Jue" },
  { label: "Viernes", shortLabel: "Vie" },
  { label: "Sabado", shortLabel: "Sab" },
  { label: "Domingo", shortLabel: "Dom" },
];

export function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDateKey(value: string) {
  return new Date(`${value}T12:00:00`);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getCurrentHabitWeek(today = new Date()) {
  const todayKey = toDateKey(today);
  const isoDay = today.getDay() === 0 ? 7 : today.getDay();
  const monday = addDays(today, 1 - isoDay);
  const weekDays = WEEKDAY_LABELS.map((item, index) => {
    const date = addDays(monday, index);
    const dateKey = toDateKey(date);

    return {
      date: dateKey,
      dayNumber: index + 1,
      isToday: dateKey === todayKey,
      label: item.label,
      shortLabel: item.shortLabel,
    } satisfies HabitWeekDay;
  });

  return {
    today: todayKey,
    weekDays,
    weekEnd: weekDays[6].date,
    weekStart: weekDays[0].date,
  };
}

export function isHabitDateMarkable(date: string, today: string, weekStart: string) {
  return date >= weekStart && date <= today;
}

export function isAssignmentInDate(
  assignment:
    | { end_date: string | null; start_date: string }
    | Pick<HabitAssignmentSummary, "endDate" | "startDate">,
  date: string,
) {
  const startDate =
    "start_date" in assignment ? assignment.start_date : assignment.startDate;
  const endDate = "end_date" in assignment ? assignment.end_date : assignment.endDate;

  return startDate <= date && (!endDate || endDate >= date);
}

export function isAssignmentApplicableOnDate(
  assignment: Pick<
    HabitAssignmentSummary,
    "active" | "daysOfWeek" | "endDate" | "startDate"
  >,
  date: string,
) {
  const dayNumber = parseDateKey(date).getDay();
  const isoDay = dayNumber === 0 ? 7 : dayNumber;

  return (
    isoDay >= 1 &&
    isoDay <= 7 &&
    assignment.active &&
    assignment.daysOfWeek.includes(isoDay) &&
    isAssignmentInDate(assignment, date)
  );
}
