import type {
 HabitAssignmentSummary,
 HabitSummary,
 NutritionHabitTrackerData,
} from "@/lib/habits/utils";

export type CompletionOverrides = Record<string, boolean>;

export type HabitTrackerProps = {
 data: NutritionHabitTrackerData;
 isClient: boolean;
 showCatalog?: boolean;
 showAssignments?: boolean;
};

export type HabitCatalogConfirmation = {
 habit: HabitSummary;
 type: "activate" | "deactivate" | "delete";
};

export type HabitAssignmentConfirmation = {
 assignment: HabitAssignmentSummary;
 type: "activate" | "deactivate";
};

