import type {
  ExerciseDifficulty,
  ExerciseOption,
} from "@/types/exercise";
import type { WorkoutTemplateSnapshot } from "@/types/workout-template";

export type RoutineDifficulty = ExerciseDifficulty;

export type RoutineListItem = {
  category: string;
  createdAt: string;
  creatorName: string;
  description: string;
  difficulty: RoutineDifficulty;
  exerciseCount: number;
  id: string;
  identifier: string | null;
  isActive: boolean;
  name: string;
  targetAudience: string;
  updatedAt: string;
};

export type RoutineExerciseDetail = {
  durationMinutes: number | null;
  exercise: ExerciseOption;
  id: string;
  notes: string | null;
  position: number;
  repetitions: string | null;
  restSeconds: number | null;
  series: number | null;
};

export type RoutineDetail = {
  category: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  description: string;
  difficulty: RoutineDifficulty;
  exercises: RoutineExerciseDetail[];
  id: string;
  identifier: string | null;
  isActive: boolean;
  name: string;
  targetAudience: string;
  updatedAt: string;
};

export type RoutineManagementOverview = {
  activeCount: number;
  exerciseCount: number;
  routines: RoutineListItem[];
};

export type RoutineAssignmentState =
  | "active"
  | "archived"
  | "expired"
  | "upcoming";

export type RoutineAssignmentSummary = {
  assignmentType: "legacy-training" | "template";
  createdAt: string;
  daysRemaining: number | null;
  description: string | null;
  detailAvailable: boolean;
  durationWeeks: number | null;
  endDate: string | null;
  id: string;
  routineId: string | null;
  startDate: string | null;
  state: RoutineAssignmentState;
  templateId: string | null;
  title: string;
};

export type RoutineAssignmentDetail = {
  assignment: RoutineAssignmentSummary;
  routine: RoutineDetail | null;
  routineSource: "live" | "snapshot" | null;
  template: WorkoutTemplateSnapshot | null;
};

export type AssignableRoutine = {
  category: string;
  description: string;
  difficulty: RoutineDifficulty;
  id: string;
  identifier: string | null;
  name: string;
};

export type AssignableTrainingClient = {
  avatarUrl: string | null;
  contact: string | null;
  currentAssignment: RoutineAssignmentSummary | null;
  id: string;
  name: string;
};

export type ClientTrainingOverview = {
  currentAssignment: RoutineAssignmentSummary | null;
  currentRoutine: RoutineDetail | null;
  currentTemplate: WorkoutTemplateSnapshot | null;
  history: RoutineAssignmentSummary[];
};
