"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleCheck,
  CircleOff,
  Dumbbell,
  Loader2,
  Save,
  Trash2,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AppPanel } from "@/components/app/AppScreen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteProfessionalAccount,
  setProfessionalActive,
  updateProfessionalAccount,
  type ProfessionalAccountListItem,
} from "@/lib/actions/professional-accounts";
import {
  updateProfessionalAccountSchema,
  type UpdateProfessionalAccountValues,
} from "@/lib/validations/professional-accounts";
import { cn } from "@/lib/utils";

const specialtyOptions = [
  { label: "Nutrición", value: "nutrition" },
  { label: "Entrenamiento", value: "training" },
  { label: "Ambas áreas", value: "both" },
] as const;

const inputClasses =
  "mt-2 h-12 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-2 text-sm font-semibold text-danger" role="alert">
      {message}
    </p>
  ) : null;
}

export function ProfessionalAccountManager({
  professional,
}: {
  professional: ProfessionalAccountListItem;
}) {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<
    "delete" | "status" | null
  >(null);
  const [serverMessage, setServerMessage] = useState("");
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<UpdateProfessionalAccountValues>({
    defaultValues: {
      bio: professional.bio,
      fullName: professional.fullName,
      professionalId: professional.id,
      specialty: professional.specialty,
    },
    resolver: zodResolver(updateProfessionalAccountSchema),
  });

  async function onSubmit(values: UpdateProfessionalAccountValues) {
    clearErrors();
    setServerMessage("");

    const result = await updateProfessionalAccount(values);

    if (result.status === "error") {
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        if (message) {
          setError(field as keyof UpdateProfessionalAccountValues, {
            message,
          });
        }
      }

      setServerMessage(result.message);
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  async function handleStatusChange() {
    const result = await setProfessionalActive(
      professional.id,
      !professional.isActive,
    );

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  async function handleDelete() {
    const result = await deleteProfessionalAccount(professional.id);

    if (result.status === "error") {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/app/configuracion/profesionales");
    router.refresh();
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <AppPanel
        title="Datos profesionales"
        description="El email se conserva como dato de acceso y no se modifica desde esta pantalla."
      >
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <input type="hidden" {...register("professionalId")} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="professional-full-name">Nombre completo</Label>
              <Input
                id="professional-full-name"
                autoComplete="name"
                className={inputClasses}
                aria-describedby={
                  errors.fullName ? "professional-full-name-error" : undefined
                }
                aria-invalid={Boolean(errors.fullName)}
                {...register("fullName")}
              />
              <FieldError
                id="professional-full-name-error"
                message={errors.fullName?.message}
              />
            </div>

            <div>
              <Label htmlFor="professional-email">Email</Label>
              <Input
                id="professional-email"
                value={professional.email || "Email no disponible"}
                className={cn(inputClasses, "text-muted")}
                readOnly
              />
            </div>
          </div>

          <div>
            <Label htmlFor="professional-specialty">Especialidad</Label>
            <select
              id="professional-specialty"
              className={cn(inputClasses, "w-full appearance-none")}
              aria-describedby={
                errors.specialty ? "professional-specialty-error" : undefined
              }
              aria-invalid={Boolean(errors.specialty)}
              {...register("specialty")}
            >
              {specialtyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError
              id="professional-specialty-error"
              message={errors.specialty?.message}
            />
            <p className="mt-2 text-sm leading-6 text-muted">
              No se puede retirar un área mientras tenga clientes asignados en
              ese servicio.
            </p>
          </div>

          <div>
            <Label htmlFor="professional-bio">Descripción interna</Label>
            <textarea
              id="professional-bio"
              rows={5}
              className="mt-2 w-full resize-y rounded-control border border-border bg-surface px-4 py-3 text-sm text-charcoal shadow-soft outline-none placeholder:text-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-primary/20"
              placeholder="Notas o descripción profesional opcional"
              aria-describedby={
                errors.bio ? "professional-bio-error" : undefined
              }
              aria-invalid={Boolean(errors.bio)}
              {...register("bio")}
            />
            <FieldError
              id="professional-bio-error"
              message={errors.bio?.message}
            />
          </div>

          {serverMessage ? (
            <Alert
              variant="destructive"
              className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
            >
              <AlertDescription className="font-semibold text-danger">
                {serverMessage}
              </AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </AppPanel>

      <div className="space-y-6">
        <AppPanel
          title="Estado"
          description={
            professional.isActive
              ? "La cuenta puede usar sus funcionalidades profesionales."
              : "La cuenta solo conserva acceso a configuración básica."
          }
          tone={professional.isActive ? "primary" : "accent"}
        >
          <div
            className={cn(
              "flex items-center gap-3 rounded-[18px] border p-4",
              professional.isActive
                ? "border-success/20 bg-success/5 text-success"
                : "border-danger/20 bg-danger/5 text-danger",
            )}
          >
            {professional.isActive ? (
              <CircleCheck className="size-5" aria-hidden="true" />
            ) : (
              <CircleOff className="size-5" aria-hidden="true" />
            )}
            <span className="font-extrabold">
              {professional.isActive ? "Profesional activo" : "Profesional inactivo"}
            </span>
          </div>

          <Button
            type="button"
            className="mt-4 w-full"
            variant={professional.isActive ? "destructive" : "default"}
            onClick={() => setConfirmAction("status")}
          >
            {professional.isActive ? (
              <CircleOff className="size-4" aria-hidden="true" />
            ) : (
              <CircleCheck className="size-4" aria-hidden="true" />
            )}
            {professional.isActive ? "Desactivar profesional" : "Activar profesional"}
          </Button>
        </AppPanel>

        <AppPanel
          title="Asignaciones"
          description="Las asignaciones se conservan cuando la cuenta se desactiva."
        >
          <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="h-fit self-start rounded-[18px] border border-border bg-background p-4">
              <Utensils className="size-4 text-warm-brown" aria-hidden="true" />
              <p className="mt-3 text-2xl font-semibold text-charcoal">
                {professional.assignedNutritionClients}
              </p>
              <p className="mt-1 text-sm font-bold text-muted">
                Clientes de nutrición
              </p>
            </div>
            <div className="h-fit self-start rounded-[18px] border border-border bg-background p-4">
              <Dumbbell className="size-4 text-warm-brown" aria-hidden="true" />
              <p className="mt-3 text-2xl font-semibold text-charcoal">
                {professional.assignedTrainingClients}
              </p>
              <p className="mt-1 text-sm font-bold text-muted">
                Clientes de entrenamiento
              </p>
            </div>
          </div>
        </AppPanel>

        <AppPanel
          title="Eliminar cuenta"
          description="Solo es posible cuando no existen clientes ni registros profesionales vinculados."
        >
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={() => setConfirmAction("delete")}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar profesional
          </Button>
        </AppPanel>
      </div>

      <ConfirmationDialog
        open={confirmAction === "status"}
        onOpenChange={(open) => setConfirmAction(open ? "status" : null)}
        title={
          professional.isActive
            ? "Desactivar profesional"
            : "Activar profesional"
        }
        description={
          professional.isActive
            ? "La cuenta dejara de usar funcionalidades profesionales. Sus clientes y registros se conservaran."
            : "La cuenta recuperara los permisos correspondientes a su especialidad actual."
        }
        confirmLabel={professional.isActive ? "Desactivar" : "Activar"}
        pendingLabel={
          professional.isActive ? "Desactivando..." : "Activando..."
        }
        tone={professional.isActive ? "destructive" : "default"}
        onConfirm={handleStatusChange}
      />

      <ConfirmationDialog
        open={confirmAction === "delete"}
        onOpenChange={(open) => setConfirmAction(open ? "delete" : null)}
        title="Eliminar cuenta profesional"
        description="Esta acción elimina la cuenta de acceso. Se bloqueará automáticamente si existen clientes, planes, citas, recursos u otros registros vinculados."
        confirmLabel="Eliminar profesional"
        pendingLabel="Eliminando..."
        tone="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
