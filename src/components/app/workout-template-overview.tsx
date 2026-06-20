import {
  WorkoutTemplateView,
  type TemplateStatusTone,
  type WorkoutTemplateMetaItem,
  type WorkoutTemplateViewer,
} from "@/components/app/workout-template-view";
import type {
  WorkoutTemplateDetail,
  WorkoutTemplateSnapshot,
} from "@/types/workout-template";

export type { TemplateStatusTone } from "@/components/app/workout-template-view";

type TemplateOverviewDay = WorkoutTemplateSnapshot["days"][number] & {
  id: string;
};

type TemplateOverviewModel = {
  assignedDayCount?: number;
  createdAt?: string;
  creatorName?: string | null;
  cycleDays: number;
  days: TemplateOverviewDay[];
  description: string | null;
  id: string;
  identifier?: string | null;
  isActive?: boolean;
  missingDayCount?: number;
  name: string;
  updatedAt?: string;
};

function getTemplateModel(
  template: WorkoutTemplateDetail | WorkoutTemplateSnapshot,
): TemplateOverviewModel {
  if ("template" in template) {
    return {
      cycleDays: template.template.cycleDays,
      days: template.days.map((day) => ({
        ...day,
        id: `${template.template.id}-${day.dayNumber}`,
      })),
      description: template.template.description,
      id: template.template.id,
      name: template.template.name,
    };
  }

  return {
    ...template,
    days: template.days.map((day) => ({
      dayNumber: day.dayNumber,
      id: day.id,
      routine: day.routine,
      weekday: day.weekday,
    })),
  };
}

function getDefaultStatus(model: TemplateOverviewModel) {
  if (typeof model.isActive !== "boolean") {
    return null;
  }

  return model.isActive ? "Activa" : "Inactiva";
}

function getDefaultStatusTone(model: TemplateOverviewModel): TemplateStatusTone {
  if (model.isActive === false) {
    return "inactive";
  }

  if (model.isActive === true) {
    return "active";
  }

  return "neutral";
}

function toSnapshot(model: TemplateOverviewModel): WorkoutTemplateSnapshot {
  return {
    days: model.days.map((day) => ({
      dayNumber: day.dayNumber,
      routine: day.routine,
      weekday: day.weekday,
    })),
    template: {
      cycleDays: model.cycleDays,
      description: model.description,
      id: model.id,
      name: model.name,
    },
    version: 1,
  };
}

export function TemplateOverview({
  currentDayNumber,
  emptyMessage = "Esta plantilla no tiene dias configurados.",
  routineHref,
  showExerciseDetails,
  statusLabel,
  statusTone,
  template,
  viewer,
}: {
  currentDayNumber?: number | null;
  emptyMessage?: string;
  routineHref?: (routineId: string) => string | null;
  showExerciseDetails?: boolean;
  statusLabel?: string | null;
  statusTone?: TemplateStatusTone;
  template: WorkoutTemplateDetail | WorkoutTemplateSnapshot;
  viewer: WorkoutTemplateViewer;
}) {
  const model = getTemplateModel(template);
  const resolvedStatusLabel = statusLabel ?? getDefaultStatus(model);
  const routineHrefs = routineHref
    ? Object.fromEntries(
        model.days
          .map((day) => [day.routine.id, routineHref(day.routine.id)] as const)
          .filter((entry): entry is readonly [string, string] =>
            Boolean(entry[1]),
          ),
      )
    : undefined;
  const metaItems: WorkoutTemplateMetaItem[] = [
    model.creatorName && viewer === "professional"
      ? {
          kind: "user",
          label: "Creador",
          value: model.creatorName,
        }
      : null,
  ].filter(Boolean) as WorkoutTemplateMetaItem[];

  return (
    <WorkoutTemplateView
      assignedDayCount={model.assignedDayCount ?? model.days.length}
      currentDayNumber={currentDayNumber}
      emptyMessage={emptyMessage}
      identifier={model.identifier}
      metaItems={metaItems}
      missingDayCount={model.missingDayCount ?? 0}
      routineHrefs={routineHrefs}
      snapshot={toSnapshot(model)}
      startExpanded={
        showExerciseDetails === false
          ? "none"
          : viewer === "professional"
            ? "all"
            : currentDayNumber
              ? "current"
              : "all"
      }
      statusLabel={resolvedStatusLabel}
      statusTone={statusTone ?? getDefaultStatusTone(model)}
      viewer={viewer}
    />
  );
}
