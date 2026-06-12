"use client";

import { Loader2, Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  const [isPending, startTransition] = useTransition();

  function toggleStatus() {
    startTransition(async () => {
      const result = await setRoutineActive(routineId, !isActive);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      size="icon"
      variant={isActive ? "destructive" : "outline"}
      disabled={isPending}
      onClick={toggleStatus}
      aria-label={
        isActive
          ? `Desactivar ${routineName}`
          : `Activar ${routineName}`
      }
    >
      {isPending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : isActive ? (
        <PowerOff aria-hidden="true" />
      ) : (
        <Power aria-hidden="true" />
      )}
    </Button>
  );
}
