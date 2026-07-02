import type { Enums, Tables } from "@/types/database";

export type DietPlan = Tables<"diet_plans">;
export type WorkoutPlan = Tables<"workout_plans">;
export type Resource = Tables<"resources">;

export type ProfessionalWithSpecialty = Pick<
 Tables<"profiles">,
 "avatar_url" | "created_at" | "full_name" | "id" | "role"
> & {
 specialty: Enums<"professional_specialty"> | null;
};

export type ClientWithServices = Pick<
 Tables<"profiles">,
 "avatar_url" | "created_at" | "full_name" | "id" | "role"
> & {
 assignedNutritionistId: string | null;
 assignedTrainerId: string | null;
 hasNutritionService: boolean;
 hasTrainingService: boolean;
 isClientActivated: boolean;
 serviceType: "both" | "none" | "nutrition" | "training";
};

export type ActivatedClient = ClientWithServices & {
 isClientActivated: true;
 serviceType: "both" | "nutrition" | "training";
};

export type PendingClient = ClientWithServices & {
 assignedNutritionistId: null;
 assignedTrainerId: null;
 hasNutritionService: false;
 hasTrainingService: false;
 isClientActivated: false;
 serviceType: "none";
};
