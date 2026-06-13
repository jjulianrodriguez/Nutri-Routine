"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignRoutineToClient } from "@/lib/actions/routines";
import {
  routineAssignmentSchema,
  type RoutineAssignmentFormValues,
} from "@/lib/validations/routine-assignments";
import type {
  AssignableRoutine,
  AssignableTrainingClient,
} from "@/types/routine";

const inputClasses =
  "mt-2 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft focus-visible:ring-primary/20";

export function RoutineAssignmentForm({
  clients,
  defaultClientId = "",
  defaultRoutineId = "",
  defaultStartDate,
  routines,
}: {
  clients: AssignableTrainingClient[];
  defaultClientId?: string;
  defaultRoutineId?: string;
  defaultStartDate: string;
  routines: AssignableRoutine[];
}) {
  const router = useRouter();
  const [pendingReplacement, setPendingReplacement] = useState<{
    client: AssignableTrainingClient;
    values: RoutineAssignmentFormValues;
  } | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<RoutineAssignmentFormValues>({
    defaultValues: {
      clientId: defaultClientId,
      durationWeeks: "6",
      routineId: defaultRoutineId,
      startDate: defaultStartDate,
    },
    resolver: zodResolver(routineAssignmentSchema),
  });

  async function assignRoutine(values: RoutineAssignmentFormValues) {
    const result = await assignRoutineToClient(values);

    if (result.status === "error") {
      setError("root", { message: result.message });
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    reset({
      clientId: "",
      durationWeeks: values.durationWeeks,
      routineId: values.routineId,
      startDate: values.startDate,
    });
    router.refresh();
  }

  async function onSubmit(values: RoutineAssignmentFormValues) {
    const client = clients.find((item) => item.id === values.clientId);

    if (client?.currentAssignment) {
      setPendingReplacement({ client, values });
      return;
    }

    await assignRoutine(values);
  }

  async function confirmReplacement() {
    if (pendingReplacement) {
      await assignRoutine(pendingReplacement.values);
    }
  }

  if (clients.length === 0) {
    return (
      <Alert className="rounded-[18px] border-border bg-background px-4 py-3">
        <AlertDescription className="font-semibold text-muted">
          No tienes clientes de entrenamiento asignados actualmente.
        </AlertDescription>
      </Alert>
    );
  }

  if (routines.length === 0) {
    return (
      <Alert className="rounded-[18px] border-border bg-background px-4 py-3">
        <AlertDescription className="font-semibold text-muted">
          No hay rutinas activas disponibles para asignar.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(8rem,0.55fr)_minmax(10rem,0.65fr)_auto] xl:items-end"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div>
        <Label htmlFor="assignment-client" className="font-extrabold text-charcoal">
          Cliente
        </Label>
        <select
          id="assignment-client"
          className={`${inputClasses} h-11 w-full appearance-none text-sm font-semibold`}
          aria-invalid={Boolean(errors.clientId)}
          {...register("clientId")}
        >
          <option value="">Selecciona un cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
              {client.currentAssignment
                ? ` - actual: ${client.currentAssignment.title}`
                : ""}
            </option>
          ))}
        </select>
        {errors.clientId ? (
          <p className="mt-2 text-sm font-semibold text-danger" role="alert">
            {errors.clientId.message}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="assignment-routine" className="font-extrabold text-charcoal">
          Rutina
        </Label>
        <select
          id="assignment-routine"
          className={`${inputClasses} h-11 w-full appearance-none text-sm font-semibold`}
          aria-invalid={Boolean(errors.routineId)}
          {...register("routineId")}
        >
          <option value="">Selecciona una rutina</option>
          {routines.map((routine) => (
            <option key={routine.id} value={routine.id}>
              {routine.name} - {routine.category}
            </option>
          ))}
        </select>
        {errors.routineId ? (
          <p className="mt-2 text-sm font-semibold text-danger" role="alert">
            {errors.routineId.message}
          </p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor="assignment-duration"
          className="font-extrabold text-charcoal"
        >
          Duracion
        </Label>
        <div className="relative">
          <Input
            id="assignment-duration"
            type="number"
            min="1"
            max="104"
            inputMode="numeric"
            className={`${inputClasses} pr-20`}
            aria-invalid={Boolean(errors.durationWeeks)}
            {...register("durationWeeks")}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-muted">
            semanas
          </span>
        </div>
        {errors.durationWeeks ? (
          <p className="mt-2 text-sm font-semibold text-danger" role="alert">
            {errors.durationWeeks.message}
          </p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor="assignment-start-date"
          className="font-extrabold text-charcoal"
        >
          Fecha de inicio
        </Label>
        <Input
          id="assignment-start-date"
          type="date"
          className={inputClasses}
          aria-invalid={Boolean(errors.startDate)}
          {...register("startDate")}
        />
        {errors.startDate ? (
          <p className="mt-2 text-sm font-semibold text-danger" role="alert">
            {errors.startDate.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <CalendarPlus aria-hidden="true" />
        )}
        {isSubmitting ? "Asignando..." : "Asignar"}
      </Button>

      {errors.root?.message ? (
        <Alert
          variant="destructive"
          className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3 md:col-span-2 xl:col-span-5"
        >
          <AlertDescription className="font-semibold text-danger">
            {errors.root.message}
          </AlertDescription>
        </Alert>
      ) : null}

      <ConfirmationDialog
        open={Boolean(pendingReplacement)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingReplacement(null);
          }
        }}
        title="Reemplazar rutina activa"
        description={
          pendingReplacement
            ? `${pendingReplacement.client.name} ya tiene "${pendingReplacement.client.currentAssignment?.title}" activa. La asignación actual se archivará antes de guardar la nueva rutina.`
            : ""
        }
        confirmLabel="Reemplazar rutina"
        pendingLabel="Asignando…"
        tone="destructive"
        onConfirm={confirmReplacement}
      />
    </form>
  );
}
