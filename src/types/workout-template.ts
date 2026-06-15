import type {
  RoutineDetail,
  RoutineExerciseDetail,
  RoutineListItem,
} from "@/types/routine";

export type WorkoutTemplateListItem = {
  createdAt: string;
  creatorId: string;
  creatorName: string;
  cycleDays: number;
  description: string | null;
  id: string;
  isActive: boolean;
  name: string;
  updatedAt: string;
};

export type WorkoutTemplateDay = {
  dayNumber: number;
  id: string;
  routine: RoutineDetail;
};

export type WorkoutTemplateDetail = WorkoutTemplateListItem & {
  days: WorkoutTemplateDay[];
};

export type AssignableWorkoutTemplate = Pick<
  WorkoutTemplateListItem,
  "cycleDays" | "description" | "id" | "name"
>;

export type WorkoutSnapshotRoutine = Pick<
  RoutineListItem,
  | "category"
  | "description"
  | "difficulty"
  | "id"
  | "name"
  | "targetAudience"
> & {
  exercises: RoutineExerciseDetail[];
};

export type WorkoutTemplateSnapshot = {
  days: {
    dayNumber: number;
    routine: WorkoutSnapshotRoutine;
  }[];
  template: {
    cycleDays: number;
    description: string | null;
    id: string;
    name: string;
  };
  version: number;
};
