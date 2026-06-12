"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignRoutineToClient } from "@/lib/actions/routines";
import {
  routineAssignmentSchema,
  type RoutineAssignmentFormValues,
} from "@/lib/validations/routine-assignments";
import type { AssignableTrainingClient } from "@/types/routine";

const inputClasses =
  "mt-2 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft focus-visible:ring-primary/20";

export function RoutineAssignmentForm({
  clients,
  defaultStartDate,
  routineId,
}: {
  clients: AssignableTrainingClient[];
  defaultStartDate: string;
  routineId: string;
}) {
  const router = useRouter();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<RoutineAssignmentFormValues>({
    defaultValues: {
      clientId: "",
      durationWeeks: "6",
      routineId,
      startDate: defaultStartDate,
    },
    resolver: zodResolver(routineAssignmentSchema),
  });

  async function onSubmit(values: RoutineAssignmentFormValues) {
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
      routineId,
      startDate: values.startDate,
    });
    router.refresh();
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

  return (
    <form
      className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(8rem,0.6fr)_minmax(10rem,0.7fr)_auto] lg:items-end"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <input type="hidden" {...register("routineId")} />

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
              {client.currentRoutineName
                ? ` - actual: ${client.currentRoutineName}`
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
          className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3 lg:col-span-4"
        >
          <AlertDescription className="font-semibold text-danger">
            {errors.root.message}
          </AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
