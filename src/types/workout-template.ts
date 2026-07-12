import type {
 RoutineDetail,
} from "@/types/routine";
import type { WorkoutWeekday } from "@/lib/workout-templates/weekdays";
export type {
 WorkoutSnapshotRoutine,
 WorkoutTemplateSnapshot,
} from "@/types/workout-template-snapshot";

export type WorkoutTemplateCompleteness = {
 assignedDayCount: number;
 isComplete: boolean;
 missingDayCount: number;
};

export type WorkoutTemplateListItem = {
 assignedDayCount: number;
 createdAt: string;
 creatorId: string;
 creatorName: string;
 cycleDays: number;
 description: string | null;
 id: string;
 identifier: string | null;
 isComplete: boolean;
 isActive: boolean;
 missingDayCount: number;
 name: string;
 updatedAt: string;
};

export type WorkoutTemplateDay = {
 dayNumber: number;
 id: string;
 routine: RoutineDetail;
 weekday: WorkoutWeekday | null;
};

export type WorkoutTemplateDetail = WorkoutTemplateListItem & {
 days: WorkoutTemplateDay[];
};

export type AssignableWorkoutTemplate = Pick<
 WorkoutTemplateListItem,
 | "assignedDayCount"
 | "cycleDays"
 | "description"
 | "id"
 | "identifier"
 | "isComplete"
 | "missingDayCount"
 | "name"
>;

