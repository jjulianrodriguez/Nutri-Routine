"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteRoutine } from "@/lib/actions/routines";

export function DeleteRoutineButton({ routineId }: { routineId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Esta accion eliminara la rutina y su configuracion de ejercicios.",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteRoutine(routineId);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/app/entrenamiento");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="lg"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      {isDeleting ? "Eliminando..." : "Eliminar rutina"}
    </Button>
  );
}
