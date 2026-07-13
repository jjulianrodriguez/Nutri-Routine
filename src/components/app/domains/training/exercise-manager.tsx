"use client";

import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";

import { ExerciseFormSection } from "./exercise-manager/exercise-form-section";
import { ExerciseLibrarySection } from "./exercise-manager/exercise-library-section";
import { useExerciseManager } from "./exercise-manager/hooks/use-exercise-manager";
import type { ExerciseManagerProps } from "./exercise-manager/types";

export function ExerciseManager(props: ExerciseManagerProps) {
 const manager = useExerciseManager(props);
 const { confirmation } = manager;

 return (
  <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-start">
   <ExerciseFormSection manager={manager} />
   <ExerciseLibrarySection manager={manager} />

   <ConfirmationDialog
    open={Boolean(confirmation)}
    onOpenChange={(open) => {
     if (!open) manager.setConfirmation(null);
    }}
    title={manager.confirmationTitle}
    description={manager.confirmationDescription}
    confirmLabel={manager.confirmationLabel}
    pendingLabel={
     confirmation?.type === "delete"
      ? "Eliminando…"
      : confirmation?.type === "status"
        ? "Actualizando…"
        : "Guardando…"
    }
    tone={
     confirmation?.type === "delete" ||
     (confirmation?.type === "status" && confirmation.exercise.isActive)
      ? "destructive"
      : "default"
    }
    onConfirm={manager.confirmAction}
   />
  </div>
 );
}
