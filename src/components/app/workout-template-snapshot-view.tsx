import {
 TemplateOverview,
 type TemplateStatusTone,
} from "@/components/app/workout-template-overview";
import type { WorkoutTemplateSnapshot } from "@/types/workout-template";

export function WorkoutTemplateSnapshotView({
 currentDayNumber,
 snapshot,
 statusLabel = "Plantilla asignada",
 statusTone = "neutral",
}: {
 currentDayNumber?: number | null;
 snapshot: WorkoutTemplateSnapshot;
 statusLabel?: string | null;
 statusTone?: TemplateStatusTone;
}) {
 return (
 <TemplateOverview
 currentDayNumber={currentDayNumber}
 showExerciseDetails
 statusLabel={statusLabel}
 statusTone={statusTone}
 template={snapshot}
 viewer="client"
 />
 );
}
