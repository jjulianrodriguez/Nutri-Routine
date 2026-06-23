"use client";

import { ArchiveX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { unassignRoutineFromClient } from "@/lib/actions/routines";

export function RoutineUnassignButton({
  assignmentId,
  assignmentName,
  clientName,
}: {
  assignmentId: string;
  assignmentName: string;
  clientName: string;
}) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleUnassign() {
    try {
      const result = await unassignRoutineFromClient(assignmentId);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error(
        "Ocurrió un error inesperado al desasignar la plantilla. Inténtalo de nuevo.",
      );
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setIsConfirming(true)}
      >
        <ArchiveX aria-hidden="true" />
        Desasignar
      </Button>

      <ConfirmationDialog
        open={isConfirming}
        onOpenChange={setIsConfirming}
        title="Desasignar plantilla"
        description={`Se desasignará "${assignmentName}" de ${clientName}. El cliente dejará de verla como plantilla actual y la asignación quedará archivada en su historial.`}
        confirmLabel="Desasignar"
        pendingLabel="Desasignando…"
        tone="destructive"
        onConfirm={handleUnassign}
      />
    </>
  );
}
