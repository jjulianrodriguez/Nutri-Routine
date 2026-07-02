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
 multimediaUrls: string[];
 muscleGroup: string;
 name: string;
};

export type ExerciseListItem = ExerciseOption & {
 createdAt: string;
 createdBy: string;
 creatorName: string;
 updatedAt: string;
};

export type ExerciseStatusFilter = "active" | "all" | "inactive";

export type ExerciseListFilters = {
 category?: string;
 difficulty?: ExerciseDifficulty | "all";
 exerciseType?: string;
 muscleGroup?: string;
 page: number;
 pageSize: number;
 query?: string;
 status?: ExerciseStatusFilter;
};

export type ExerciseListResult = {
 hasMore: boolean;
 items: ExerciseListItem[];
 page: number;
 pageSize: number;
 totalCount: number;
};

export type ExerciseFilterOptions = {
 categories: string[];
 exerciseTypes: string[];
 muscleGroups: string[];
};
