import { Dumbbell, Leaf, Layers3, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type RelationshipBadgeTone =
  | "accent"
  | "danger"
  | "muted"
  | "neutral"
  | "primary"
  | "success"
  | "warning";

type AssignedProfessionalCard = {
  icon: LucideIcon;
  id: string | null;
  name: string | null;
  planLabel: string;
  roleLabel: string;
};

const badgeToneClasses: Record<RelationshipBadgeTone, string> = {
  accent: "border-accent bg-secondary-soft text-foreground",
  danger: "border-danger/20 bg-danger/10 text-danger",
  muted: "border-border bg-background text-muted",
  neutral: "border-secondary-accent bg-secondary-accent-soft text-foreground",
  primary: "border-primary bg-primary text-primary-foreground",
  success: "border-success bg-success text-foreground",
  warning: "border-warning bg-warning text-foreground",
};

export function RelationshipBadge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: RelationshipBadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold",
        badgeToneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function getPlanBadgeLabel({
  hasNutritionService,
  hasTrainingService,
}: {
  hasNutritionService: boolean;
  hasTrainingService: boolean;
}) {
  if (hasNutritionService && hasTrainingService) {
    return "Ambos planes";
  }

  if (hasNutritionService) {
    return "Nutrición";
  }

  if (hasTrainingService) {
    return "Entrenamiento";
  }

  return "Sin planes";
}

export function getAssignedRelationBadge({
  assignedId,
  currentUserId,
  isAdmin,
  isProfessional,
}: {
  assignedId: string | null;
  currentUserId: string;
  isAdmin?: boolean;
  isProfessional: boolean;
}) {
  if (!assignedId) {
    return {
      label: "Sin profesional asignado",
      tone: "muted" as const,
    };
  }

  if (isAdmin) {
    return {
      label: "Plan activo",
      tone: "primary" as const,
    };
  }

  if (!isProfessional) {
    return {
      label: "Asignación activa",
      tone: "primary" as const,
    };
  }

  return assignedId === currentUserId
    ? {
        label: "Asignado a vos",
        tone: "success" as const,
      }
    : {
        label: "Asignado a otro profesional",
        tone: "warning" as const,
      };
}

export function getProfessionalRoleLabel(area: "both" | "nutrition" | "training") {
  if (area === "nutrition") {
    return "Nutricionista";
  }

  if (area === "training") {
    return "Entrenadora";
  }

  return "Entrenadora y nutricionista";
}

function buildAssignedProfessionalCards({
  assignedNutritionistId,
  assignedNutritionistName,
  assignedTrainerId,
  assignedTrainerName,
}: {
  assignedNutritionistId: string | null;
  assignedNutritionistName: string | null;
  assignedTrainerId: string | null;
  assignedTrainerName: string | null;
}): AssignedProfessionalCard[] {
  if (
    assignedNutritionistId &&
    assignedTrainerId &&
    assignedNutritionistId === assignedTrainerId
  ) {
    return [
      {
        icon: Layers3,
        id: assignedTrainerId,
        name: assignedTrainerName ?? assignedNutritionistName,
        planLabel: "Ambos planes",
        roleLabel: getProfessionalRoleLabel("both"),
      },
    ];
  }

  return [
    assignedTrainerId
      ? {
          icon: Dumbbell,
          id: assignedTrainerId,
          name: assignedTrainerName,
          planLabel: "Entrenamiento",
          roleLabel: getProfessionalRoleLabel("training"),
        }
      : null,
    assignedNutritionistId
      ? {
          icon: Leaf,
          id: assignedNutritionistId,
          name: assignedNutritionistName,
          planLabel: "Nutrición",
          roleLabel: getProfessionalRoleLabel("nutrition"),
        }
      : null,
  ].filter(Boolean) as AssignedProfessionalCard[];
}

export function AssignedProfessionalCards({
  assignedNutritionistId,
  assignedNutritionistName,
  assignedTrainerId,
  assignedTrainerName,
  className,
  emptyLabel = "Sin profesional asignado",
}: {
  assignedNutritionistId: string | null;
  assignedNutritionistName: string | null;
  assignedTrainerId: string | null;
  assignedTrainerName: string | null;
  className?: string;
  emptyLabel?: string;
}) {
  const professionals = buildAssignedProfessionalCards({
    assignedNutritionistId,
    assignedNutritionistName,
    assignedTrainerId,
    assignedTrainerName,
  });

  if (professionals.length === 0) {
    return (
      <div
        className={cn(
          "h-fit self-start rounded-[20px] border border-dashed border-border bg-background p-4",
          className,
        )}
      >
        <p className="font-extrabold text-foreground">{emptyLabel}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-muted">
          Cuando se active un plan, el nombre de la profesional aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid items-start gap-3 sm:grid-cols-2", className)}>
      {professionals.map((professional) => {
        const Icon = professional.icon;

        return (
          <article
            key={`${professional.id}-${professional.planLabel}`}
            className="h-fit self-start rounded-[20px] border border-border bg-background p-4"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="break-words font-extrabold text-foreground">
                  {professional.name ?? "Perfil incompleto"}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <RelationshipBadge tone="primary">
                    {professional.roleLabel}
                  </RelationshipBadge>
                  <RelationshipBadge tone="neutral">
                    {professional.planLabel}
                  </RelationshipBadge>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
