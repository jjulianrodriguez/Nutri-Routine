"use client";

import { Check, Dumbbell, Leaf, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { activateClientAccount } from "@/lib/actions/client-activation";
import type {
  AssignableProfessional,
  ClientAccountListItem,
} from "@/lib/actions/client-activation";
import type { ClientActivationService } from "@/lib/validations/client-activation";
import { cn } from "@/lib/utils";

type ClientActivationFormProps = {
  canManageNutrition: boolean;
  canManageTraining: boolean;
  client: ClientAccountListItem;
  currentUserId: string;
  nutritionists: AssignableProfessional[];
  trainers: AssignableProfessional[];
};

const selectClasses =
  "mt-2 h-12 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-charcoal shadow-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20";

function getServiceType(
  nutritionEnabled: boolean,
  trainingEnabled: boolean,
): ClientActivationService {
  if (nutritionEnabled && trainingEnabled) {
    return "both";
  }

  if (nutritionEnabled) {
    return "nutrition";
  }

  if (trainingEnabled) {
    return "training";
  }

  return "none";
}

function getPreferredProfessionalId({
  currentUserId,
  existingId,
  professionals,
}: {
  currentUserId: string;
  existingId: string | null;
  professionals: AssignableProfessional[];
}) {
  if (existingId && professionals.some((item) => item.id === existingId)) {
    return existingId;
  }

  if (professionals.some((item) => item.id === currentUserId)) {
    return currentUserId;
  }

  return professionals[0]?.id ?? "";
}

function PlanToggle({
  active,
  disabled,
  icon: Icon,
  label,
  onToggle,
}: {
  active: boolean;
  disabled: boolean;
  icon: typeof Leaf;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex min-h-14 w-full items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-55",
        active
          ? "border-primary/40 bg-primary-soft text-charcoal"
          : "border-border bg-surface text-warm-brown hover:border-primary/30 hover:bg-primary-soft/60",
      )}
    >
      <span className="flex items-center gap-3">
        <Icon className="size-5" aria-hidden="true" />
        <span className="font-extrabold">{label}</span>
      </span>
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full",
          active
            ? "bg-primary text-charcoal"
            : "border border-border bg-background text-muted",
        )}
        aria-hidden="true"
      >
        {active ? <Check className="size-4" /> : <X className="size-3.5" />}
      </span>
    </button>
  );
}

export function ClientActivationForm({
  canManageNutrition,
  canManageTraining,
  client,
  currentUserId,
  nutritionists,
  trainers,
}: ClientActivationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState("");
  const [nutritionEnabled, setNutritionEnabled] = useState(
    client.hasNutritionService,
  );
  const [trainingEnabled, setTrainingEnabled] = useState(
    client.hasTrainingService,
  );
  const [assignedNutritionistId, setAssignedNutritionistId] = useState(() =>
    getPreferredProfessionalId({
      currentUserId,
      existingId: client.assignedNutritionistId,
      professionals: nutritionists,
    }),
  );
  const [assignedTrainerId, setAssignedTrainerId] = useState(() =>
    getPreferredProfessionalId({
      currentUserId,
      existingId: client.assignedTrainerId,
      professionals: trainers,
    }),
  );
  const serviceType = getServiceType(nutritionEnabled, trainingEnabled);
  const hasRequiredProfessionals =
    (!canManageNutrition ||
      !nutritionEnabled ||
      Boolean(assignedNutritionistId)) &&
    (!canManageTraining || !trainingEnabled || Boolean(assignedTrainerId));
  const removesNutrition =
    client.hasNutritionService && !nutritionEnabled;
  const removesTraining = client.hasTrainingService && !trainingEnabled;
  const hasPlanSelection = serviceType !== "none" || client.isClientActivated;

  function submit() {
    setServerMessage("");

    if (
      (removesNutrition || removesTraining) &&
      !window.confirm(
        "Esta accion retirara acceso a las secciones desactivadas. Deseas continuar?",
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await activateClientAccount({
        assignedNutritionistId: nutritionEnabled ? assignedNutritionistId : "",
        assignedTrainerId: trainingEnabled ? assignedTrainerId : "",
        clientId: client.id,
        serviceType,
      });

      if (result.status === "error") {
        setServerMessage(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  if (!canManageNutrition && !canManageTraining) {
    return (
      <Alert className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3">
        <AlertDescription className="font-semibold text-danger">
          Tu cuenta no tiene permisos para modificar planes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 rounded-[22px] border border-border bg-background p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <PlanToggle
            active={nutritionEnabled}
            disabled={
              !canManageNutrition ||
              (!nutritionEnabled && nutritionists.length === 0)
            }
            icon={Leaf}
            label="Plan de nutricion"
            onToggle={() => setNutritionEnabled((current) => !current)}
          />
          {nutritionists.length === 0 ? (
            <p className="px-1 text-xs font-semibold leading-5 text-muted">
              No hay profesionales de nutricion disponibles para nuevas
              activaciones.
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <PlanToggle
            active={trainingEnabled}
            disabled={
              !canManageTraining ||
              (!trainingEnabled && trainers.length === 0)
            }
            icon={Dumbbell}
            label="Plan de entrenamiento"
            onToggle={() => setTrainingEnabled((current) => !current)}
          />
          {trainers.length === 0 ? (
            <p className="px-1 text-xs font-semibold leading-5 text-muted">
              No hay profesionales de entrenamiento disponibles para nuevas
              activaciones.
            </p>
          ) : null}
        </div>
      </div>

      {nutritionEnabled || trainingEnabled ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {nutritionEnabled ? (
            <div>
              <Label
                htmlFor={`nutritionist-${client.id}`}
                className="font-extrabold text-charcoal"
              >
                Profesional en nutricion
              </Label>
              <select
                id={`nutritionist-${client.id}`}
                className={selectClasses}
                disabled={!canManageNutrition}
                value={assignedNutritionistId}
                onChange={(event) =>
                  setAssignedNutritionistId(event.target.value)
                }
              >
                {nutritionists.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.fullName}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {trainingEnabled ? (
            <div>
              <Label
                htmlFor={`trainer-${client.id}`}
                className="font-extrabold text-charcoal"
              >
                Profesional en entrenamiento
              </Label>
              <select
                id={`trainer-${client.id}`}
                className={selectClasses}
                disabled={!canManageTraining}
                value={assignedTrainerId}
                onChange={(event) => setAssignedTrainerId(event.target.value)}
              >
                {trainers.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.fullName}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      ) : (
        <Alert className="rounded-[18px] border-primary/25 bg-primary-soft px-4 py-3">
          <AlertDescription className="font-semibold text-charcoal">
            Sin planes activos, el usuario solo podra entrar a configuracion.
          </AlertDescription>
        </Alert>
      )}

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

      <Button
        type="button"
        onClick={submit}
        disabled={isPending || !hasRequiredProfessionals || !hasPlanSelection}
        className={cn(
          "w-full sm:w-auto",
          (!hasRequiredProfessionals || !hasPlanSelection) && "opacity-60",
        )}
        size="lg"
        variant={
          serviceType === "none" && client.isClientActivated
            ? "destructive"
            : "default"
        }
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="size-4" />
            {serviceType === "none"
              ? client.isClientActivated
                ? "Desactivar todos los planes"
                : "Sin planes activos"
              : client.isClientActivated
                ? "Guardar cambios"
                : "Activar planes"}
          </>
        )}
      </Button>
    </div>
  );
}
