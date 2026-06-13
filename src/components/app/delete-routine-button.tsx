"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { deleteRoutine } from "@/lib/actions/routines";

export function DeleteRoutineButton({ routineId }: { routineId: string }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleDelete() {
    try {
      const result = await deleteRoutine(routineId);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/app/entrenamiento");
      router.refresh();
    } catch {
      toast.error(
        "Ocurrio un error inesperado al eliminar la rutina. Intentalo de nuevo.",
      );
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="lg"
        onClick={() => setIsConfirming(true)}
      >
        <Trash2 className="size-4" />
        Eliminar rutina
      </Button>

      <ConfirmationDialog
        open={isConfirming}
        onOpenChange={setIsConfirming}
        title="Eliminar rutina"
        description="Esta acción eliminará la rutina y su configuración de ejercicios. Las asignaciones de clientes se archivarán y dejarán de mostrarla como activa."
        confirmLabel="Eliminar rutina"
        pendingLabel="Eliminando…"
        tone="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
