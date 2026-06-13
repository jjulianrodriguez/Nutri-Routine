import type {
  ExerciseDifficulty,
  ExerciseOption,
} from "@/types/exercise";

export type RoutineDifficulty = ExerciseDifficulty;

export type RoutineListItem = {
  category: string;
  createdAt: string;
  creatorName: string;
  difficulty: RoutineDifficulty;
  exerciseCount: number;
  id: string;
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
  createdAt: string;
  daysRemaining: number | null;
  description: string | null;
  durationWeeks: number | null;
  endDate: string | null;
  id: string;
  routineId: string | null;
  startDate: string | null;
  state: RoutineAssignmentState;
  title: string;
};

export type RoutineAssignmentDetail = {
  assignment: RoutineAssignmentSummary;
  routine: RoutineDetail;
};

export type AssignableRoutine = {
  category: string;
  id: string;
  name: string;
};

export type AssignableTrainingClient = {
  currentAssignment: RoutineAssignmentSummary | null;
  id: string;
  name: string;
};

export type ClientTrainingOverview = {
  currentAssignment: RoutineAssignmentSummary | null;
  currentRoutine: RoutineDetail | null;
  history: RoutineAssignmentSummary[];
};
