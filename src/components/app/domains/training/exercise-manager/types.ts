import type {
 ExerciseFilterOptions,
 ExerciseListFilters,
 ExerciseListItem,
} from "@/types/exercise";
import type { ExerciseFormValues } from "@/lib/validations/exercises";

export type ExerciseManagerProps = {
 exercises: ExerciseListItem[];
 filterOptions: ExerciseFilterOptions;
 filters: ExerciseListFilters;
 pagination: {
  hasMore: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
 };
};

export type ExerciseConfirmation =
 | {
    exercise: ExerciseListItem;
    type: "delete" | "status";
   }
 | {
    type: "update";
    values: ExerciseFormValues;
   };

export type ExerciseFilterDraft = {
 category: string;
 difficulty: string;
 exerciseType: string;
 muscleGroup: string;
 query: string;
 status: string;
};
