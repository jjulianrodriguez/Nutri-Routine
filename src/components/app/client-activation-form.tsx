"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
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
  "mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-charcoal shadow-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20";

function getDefaultServiceType({
  canManageNutrition,
  canManageTraining,
  client,
}: {
  canManageNutrition: boolean;
  canManageTraining: boolean;
  client: ClientAccountListItem;
}): ClientActivationService {
  if (client.serviceType !== "none") {
    if (client.serviceType === "both" && canManageNutrition && canManageTraining) {
      return "both";
    }

    if (client.serviceType === "nutrition" && canManageNutrition) {
      return "nutrition";
    }

    if (client.serviceType === "training" && canManageTraining) {
      return "training";
    }
  }

  if (canManageNutrition) {
    return "nutrition";
  }

  return "training";
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

function serviceLabel(serviceType: ClientActivationService) {
  if (serviceType === "nutrition") {
    return "Nutricion";
  }

  if (serviceType === "training") {
    return "Entrenamiento";
  }

  return "Ambos servicios";
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
  const serviceOptions = useMemo(() => {
    const options: Array<{ label: string; value: ClientActivationService }> = [];

    if (canManageNutrition) {
      options.push({ label: "Nutricion", value: "nutrition" });
    }

    if (canManageTraining) {
      options.push({ label: "Entrenamiento", value: "training" });
    }

    if (canManageNutrition && canManageTraining) {
      options.push({ label: "Ambos servicios", value: "both" });
    }

    return options;
  }, [canManageNutrition, canManageTraining]);
  const [serviceType, setServiceType] = useState<ClientActivationService>(() =>
    getDefaultServiceType({
      canManageNutrition,
      canManageTraining,
      client,
    }),
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
  const needsNutrition =
    serviceType === "nutrition" || serviceType === "both";
  const needsTraining = serviceType === "training" || serviceType === "both";
  const hasRequiredProfessionals =
    (!needsNutrition || nutritionists.length > 0) &&
    (!needsTraining || trainers.length > 0);

  function submit() {
    setServerMessage("");

    startTransition(async () => {
      const result = await activateClientAccount({
        assignedNutritionistId: needsNutrition ? assignedNutritionistId : "",
        assignedTrainerId: needsTraining ? assignedTrainerId : "",
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

  if (serviceOptions.length === 0) {
    return (
      <Alert className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3">
        <AlertDescription className="font-semibold text-danger">
          Tu perfil no tiene permisos para activar servicios.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 rounded-[22px] border border-border bg-background p-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <Label
            htmlFor={`service-${client.id}`}
            className="font-extrabold text-charcoal"
          >
            Tipo de servicio
          </Label>
          <select
            id={`service-${client.id}`}
            className={selectClasses}
            value={serviceType}
            onChange={(event) =>
              setServiceType(event.target.value as ClientActivationService)
            }
          >
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {needsNutrition ? (
          <div>
            <Label
              htmlFor={`nutritionist-${client.id}`}
              className="font-extrabold text-charcoal"
            >
              Nutricionista asignada
            </Label>
            <select
              id={`nutritionist-${client.id}`}
              className={selectClasses}
              value={assignedNutritionistId}
              onChange={(event) => setAssignedNutritionistId(event.target.value)}
            >
              {nutritionists.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.fullName}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {needsTraining ? (
          <div>
            <Label
              htmlFor={`trainer-${client.id}`}
              className="font-extrabold text-charcoal"
            >
              Entrenadora asignada
            </Label>
            <select
              id={`trainer-${client.id}`}
              className={selectClasses}
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
        disabled={isPending || !hasRequiredProfessionals}
        className={cn("w-full sm:w-auto", !hasRequiredProfessionals && "opacity-60")}
        size="lg"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="size-4" />
            {client.isClientActivated
              ? `Guardar ${serviceLabel(serviceType).toLowerCase()}`
              : "Activar cliente"}
          </>
        )}
      </Button>
    </div>
  );
}
