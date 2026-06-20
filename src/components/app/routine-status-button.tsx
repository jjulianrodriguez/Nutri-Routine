"use client";

import { Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { setRoutineActive } from "@/lib/actions/routines";

export function RoutineStatusButton({
  isActive,
  routineId,
  routineName,
}: {
  isActive: boolean;
  routineId: string;
  routineName: string;
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  async function toggleStatus() {
    try {
      const result = await setRoutineActive(routineId, !isActive);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error(
        "Ocurrió un error inesperado al cambiar el estado. Inténtalo de nuevo.",
      );
    }
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant={isActive ? "destructive" : "outline"}
        onClick={() => setIsConfirming(true)}
        aria-label={
          isActive
            ? `Desactivar ${routineName}`
            : `Activar ${routineName}`
        }
      >
        {isActive ? (
          <PowerOff aria-hidden="true" />
        ) : (
          <Power aria-hidden="true" />
        )}
      </Button>

      <ConfirmationDialog
        open={isConfirming}
        onOpenChange={setIsConfirming}
        title={
          isActive ? "Desactivar entrenamiento" : "Activar entrenamiento"
        }
        description={
          isActive
            ? `"${routineName}" dejará de estar disponible para nuevas plantillas.`
            : `"${routineName}" volverá a estar disponible para plantillas.`
        }
        confirmLabel={isActive ? "Desactivar" : "Activar"}
        pendingLabel={isActive ? "Desactivando…" : "Activando…"}
        tone={isActive ? "destructive" : "default"}
        onConfirm={toggleStatus}
      />
    </>
  );
}
