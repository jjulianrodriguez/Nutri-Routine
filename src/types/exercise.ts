export type ExerciseDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type ExerciseOption = {
  category: string;
  description: string | null;
  difficulty: ExerciseDifficulty | null;
  exerciseType: string;
  id: string;
  isActive: boolean;
  multimediaUrl: string | null;
  muscleGroup: string;
  name: string;
};

export type ExerciseListItem = ExerciseOption & {
  createdAt: string;
  createdBy: string;
  creatorName: string;
  multimediaUrls: string[];
  updatedAt: string;
};
