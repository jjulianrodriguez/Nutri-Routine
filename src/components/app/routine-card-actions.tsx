"use client";

import {
  Eye,
  Layers3,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/card-actions-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { deleteRoutine, setRoutineActive } from "@/lib/actions/routines";

type RoutineCardActionsProps = {
  isActive: boolean;
  routineId: string;
  routineName: string;
};

export function RoutineCardActions({
  isActive,
  routineId,
  routineName,
}: RoutineCardActionsProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<
    "delete" | "status" | null
  >(null);

  async function handleConfirm() {
    const result =
      confirmation === "delete"
        ? await deleteRoutine(routineId)
        : await setRoutineActive(routineId, !isActive);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  return (
    <>
      <CardActionsMenu
        label={routineName}
        items={[
          {
            href: `/app/entrenamiento/rutinas/${routineId}`,
            icon: Eye,
            label: "Ver detalle",
          },
          {
            href: `/app/entrenamiento/rutinas/${routineId}/editar`,
            icon: Pencil,
            label: "Editar",
          },
          ...(isActive
            ? [
                {
                  href: `/app/entrenamiento/plantillas/nueva?training=${routineId}`,
                  icon: Layers3,
                  label: "Usar en plantilla",
                },
              ]
            : []),
          {
            destructive: isActive,
            icon: isActive ? PowerOff : Power,
            label: isActive ? "Desactivar" : "Activar",
            onSelect: () => setConfirmation("status"),
            separatorBefore: true,
          },
          {
            destructive: true,
            icon: Trash2,
            label: "Eliminar",
            onSelect: () => setConfirmation("delete"),
          },
        ]}
      />

      <ConfirmationDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmation(null);
          }
        }}
        title={
          confirmation === "delete"
            ? `Eliminar ${routineName}`
            : `${isActive ? "Desactivar" : "Activar"} ${routineName}`
        }
        description={
          confirmation === "delete"
            ? "El entrenamiento se eliminara definitivamente. Las plantillas que lo utilizan impediran la eliminacion."
            : isActive
              ? "El entrenamiento dejara de estar disponible para nuevas plantillas."
              : "El entrenamiento volvera a estar disponible para nuevas plantillas."
        }
        confirmLabel={
          confirmation === "delete"
            ? "Eliminar entrenamiento"
            : isActive
              ? "Desactivar"
              : "Activar"
        }
        pendingLabel={
          confirmation === "delete" ? "Eliminando..." : "Actualizando..."
        }
        tone={
          confirmation === "delete" || isActive ? "destructive" : "default"
        }
        onConfirm={handleConfirm}
      />
    </>
  );
}
