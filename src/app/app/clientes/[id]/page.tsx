import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Clock3,
  Dumbbell,
  History,
  HeartPulse,
  Leaf,
  Mail,
  Phone,
  Ruler,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientAvatar } from "@/components/app/client-avatar";
import {
  AppPanel,
  AppScreen,
  EmptyState,
} from "@/components/app/AppScreen";
import { Button } from "@/components/ui/button";
import { requireCurrentUserAccess } from "@/lib/auth/current-user-access";
import {
  getClientAdministrativeProfile,
  type ClientAccountStatus,
  type ClientPlanState,
  type ClientPlanSummary,
} from "@/lib/clients/profile-data";
import { cn } from "@/lib/utils";

const accountStatusLabels: Record<ClientAccountStatus, string> = {
  active: "Activa",
  pending: "Pendiente de confirmar",
  suspended: "Suspendida",
  unknown: "No disponible",
};

const planStateLabels: Record<ClientPlanState, string> = {
  active: "Vigente",
  archived: "Anterior",
  draft: "Borrador",
  expired: "Caducado",
  upcoming: "Proximo",
};

function formatDate(value: string | null, includeTime = false) {
  if (!value) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(new Date(value.includes("T") ? value : `${value}T12:00:00`));
}

function formatGender(
  value: string | null,
  description: string | null,
) {
  switch (value) {
    case "male":
      return "Masculino";
    case "female":
      return "Femenino";
    case "non_binary":
      return "No binario";
    case "prefer_not_to_say":
      return "Prefiere no indicarlo";
    case "self_described":
      return description ?? "Autodescripcion no indicada";
    default:
      return "No indicado";
  }
}

function formatMeasurement(value: number | null, unit: string) {
  if (value === null) {
    return "No indicado";
  }

  return `${new Intl.NumberFormat("es-CR", {
    maximumFractionDigits: 2,
  }).format(value)} ${unit}`;
}

function getCurrentPlan(plans: ClientPlanSummary[]) {
  const currentIndex = plans.findIndex(
    (plan) =>
      plan.state === "active" ||
      plan.state === "expired" ||
      plan.state === "upcoming",
  );

  return {
    current: currentIndex >= 0 ? plans[currentIndex] : null,
    history: plans.filter((_, index) => index !== currentIndex),
  };
}

function DetailItem({
  className,
  icon: Icon,
  label,
  value,
}: {
  className?: string;
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-border bg-background p-4",
        className,
      )}
    >
      <Icon className="size-4 text-warm-brown" aria-hidden="true" />
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-charcoal">{value}</p>
    </div>
  );
}

function ServiceCard({
  active,
  icon: Icon,
  label,
  professional,
}: {
  active: boolean;
  icon: typeof Leaf;
  label: string;
  professional: string | null;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border p-5",
        active
          ? "border-primary/35 bg-primary-soft/60"
          : "border-border bg-background",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Icon className="size-5 text-warm-brown" aria-hidden="true" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-charcoal">
          {active ? (
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
          ) : (
            <CircleOff className="size-3.5" aria-hidden="true" />
          )}
          {active ? "Activo" : "Inactivo"}
        </span>
      </div>
      <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-1 font-bold text-charcoal">
        {professional ?? "Sin profesional asignado"}
      </p>
    </div>
  );
}

function PlanCard({
  plan,
  showRoutineLink,
}: {
  plan: ClientPlanSummary;
  showRoutineLink: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-[20px] border p-4",
        plan.state === "expired"
          ? "border-danger/20 bg-danger/5"
          : "border-border bg-background",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-charcoal">
            {planStateLabels[plan.state]}
          </span>
          <h3 className="mt-3 text-lg font-extrabold text-charcoal">
            {plan.title}
          </h3>
          {plan.description ? (
            <p className="mt-2 text-sm leading-6 text-muted">
              {plan.description}
            </p>
          ) : null}
        </div>
        {showRoutineLink ? (
          plan.detailAvailable ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/app/entrenamiento/historial/${plan.id}`}>
                Abrir rutina
              </Link>
            </Button>
          ) : (
            <span className="rounded-full bg-surface px-3 py-2 text-xs font-extrabold text-muted">
              Informacion historica no disponible
            </span>
          )
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-charcoal/10 pt-3 text-xs font-bold text-warm-brown">
        <span>Inicio: {formatDate(plan.startDate)}</span>
        <span>Fin: {formatDate(plan.endDate)}</span>
        {plan.durationWeeks ? <span>{plan.durationWeeks} semanas</span> : null}
      </div>
    </article>
  );
}

function PlansPanel({
  canView,
  description,
  emptyLabel,
  plans,
  showRoutineLink = false,
  title,
}: {
  canView: boolean;
  description: string;
  emptyLabel: string;
  plans: ClientPlanSummary[];
  showRoutineLink?: boolean;
  title: string;
}) {
  const { current, history } = getCurrentPlan(plans);

  return (
    <AppPanel title={title} description={description}>
      {!canView ? (
        <EmptyState>
          El detalle esta disponible solo para el profesional asignado a esta
          area y el administrador universal.
        </EmptyState>
      ) : plans.length === 0 ? (
        <EmptyState>{emptyLabel}</EmptyState>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
              Plan actual
            </p>
            {current ? (
              <PlanCard
                plan={current}
                showRoutineLink={showRoutineLink}
              />
            ) : (
              <EmptyState>No hay un plan vigente.</EmptyState>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <History className="size-4 text-warm-brown" aria-hidden="true" />
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                Historial ({history.length})
              </p>
            </div>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    showRoutineLink={showRoutineLink}
                  />
                ))}
              </div>
            ) : (
              <EmptyState>No hay planes anteriores registrados.</EmptyState>
            )}
          </div>
        </div>
      )}
    </AppPanel>
  );
}

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireCurrentUserAccess();
  const { id } = await params;
  const client = await getClientAdministrativeProfile(id, access);

  if (!client) {
    notFound();
  }

  return (
    <AppScreen>
      <Button asChild size="lg" variant="outline">
        <Link href="/app/clientes">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a clientes
        </Link>
      </Button>

      <section className="overflow-hidden rounded-[32px] border border-border bg-surface p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ClientAvatar
            name={client.fullName}
            size="lg"
            src={client.avatarUrl}
          />
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
              Perfil del cliente
            </p>
            <h1 className="mt-3 break-words text-4xl font-semibold leading-tight text-charcoal sm:text-5xl">
              {client.fullName}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                Rol: Cliente
              </span>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                Cuenta: {accountStatusLabels[client.accountStatus]}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ServiceCard
          active={client.hasNutritionService}
          icon={Leaf}
          label="Plan de nutricion"
          professional={client.assignedNutritionistName}
        />
        <ServiceCard
          active={client.hasTrainingService}
          icon={Dumbbell}
          label="Plan de entrenamiento"
          professional={client.assignedTrainerName}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AppPanel
          title="Informacion personal"
          description="Datos opcionales visibles solo para profesionales asignados y administracion."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={Mail}
              label="Email"
              value={client.email ?? "No disponible"}
            />
            <DetailItem
              icon={Phone}
              label="Telefono"
              value={client.phone ?? "No indicado"}
            />
            <DetailItem
              icon={CalendarDays}
              label="Fecha de nacimiento"
              value={
                client.birthDate
                  ? formatDate(client.birthDate)
                  : "No indicado"
              }
            />
            <DetailItem
              icon={UserRound}
              label="Genero"
              value={formatGender(
                client.gender,
                client.genderDescription,
              )}
            />
            <DetailItem
              icon={Scale}
              label="Peso"
              value={formatMeasurement(client.weightKg, "kg")}
            />
            <DetailItem
              icon={Ruler}
              label="Altura"
              value={formatMeasurement(client.heightCm, "cm")}
            />
            <DetailItem
              className="sm:col-span-2"
              icon={HeartPulse}
              label="Enfermedades o condiciones medicas"
              value={client.medicalConditions ?? "No indicado"}
            />
          </div>
        </AppPanel>

        <AppPanel
          title="Cuenta"
          description="Estado y fechas del registro del cliente."
          tone="accent"
        >
          <div className="grid gap-3">
            <DetailItem
              icon={ShieldCheck}
              label="Estado de cuenta"
              value={accountStatusLabels[client.accountStatus]}
            />
            <DetailItem
              icon={CalendarDays}
              label="Fecha de registro"
              value={formatDate(client.createdAt, true)}
            />
            <DetailItem
              icon={Clock3}
              label="Ultima actualizacion"
              value={formatDate(client.updatedAt, true)}
            />
          </div>
        </AppPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PlansPanel
          canView={client.canViewNutritionPlans}
          description="Plan actual e historial alimenticio visible segun la asignacion profesional."
          emptyLabel="No hay planes de nutricion registrados para este cliente."
          plans={client.nutritionPlans}
          title="Nutricion"
        />
        <PlansPanel
          canView={client.canViewTrainingPlans}
          description="Rutina asignada actual e historial de entrenamiento del cliente."
          emptyLabel="No hay rutinas asignadas para este cliente."
          plans={client.trainingPlans}
          showRoutineLink
          title="Entrenamiento"
        />
      </div>
    </AppScreen>
  );
}
