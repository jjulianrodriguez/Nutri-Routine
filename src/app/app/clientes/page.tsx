import { CheckCircle2, Clock, Dumbbell, Leaf, Users } from "lucide-react";
import Link from "next/link";

import { ClientActivationForm } from "@/components/app/client-activation-form";
import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  listClientActivationData,
  type ClientAccountListItem,
  type ClientAccountsFilter,
} from "@/lib/actions/client-activation";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { cn } from "@/lib/utils";

type ClientsPageProps = {
  searchParams?: Promise<{
    filter?: string;
  }>;
};

const filterOptions: Array<{
  label: string;
  value: ClientAccountsFilter;
}> = [
  { label: "Pendientes", value: "pending" },
  { label: "Activos", value: "active" },
  { label: "Todos", value: "all" },
  { label: "Solo nutricion", value: "nutrition" },
  { label: "Solo entrenamiento", value: "training" },
  { label: "Ambos servicios", value: "both" },
  { label: "Sin servicio", value: "none" },
];

function normalizeFilter(value?: string): ClientAccountsFilter {
  if (
    value === "active" ||
    value === "all" ||
    value === "both" ||
    value === "none" ||
    value === "nutrition" ||
    value === "pending" ||
    value === "training"
  ) {
    return value;
  }

  return "pending";
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function serviceLabel(client: ClientAccountListItem) {
  if (client.hasNutritionService && client.hasTrainingService) {
    return "Nutricion y entrenamiento";
  }

  if (client.hasNutritionService) {
    return "Solo nutricion";
  }

  if (client.hasTrainingService) {
    return "Solo entrenamiento";
  }

  return "Pendiente de activacion";
}

function serviceTone(client: ClientAccountListItem) {
  if (!client.isClientActivated) {
    return "bg-primary-soft text-charcoal";
  }

  if (client.hasNutritionService && client.hasTrainingService) {
    return "bg-accent text-charcoal";
  }

  return "bg-background text-warm-brown";
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  await requireRouteAccess("/app/clientes");
  const params = await searchParams;
  const activeFilter = normalizeFilter(params?.filter);
  const data = await listClientActivationData(activeFilter);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Administracion de clientes"
        title="Clientes y cuentas pendientes"
        description="Activa cuentas registradas como clientes de nutricion, entrenamiento o ambos sin cambiar profiles.role."
      />

      {data.error ? (
        <Alert
          variant="destructive"
          className="rounded-[22px] border-danger/20 bg-danger/5 px-5 py-4"
        >
          <AlertDescription className="font-semibold text-danger">
            {data.error}
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Cuentas pendientes"
          value={String(data.counts.pending)}
          detail="Sin servicio asignado"
        />
        <StatTile
          label="Clientes activos"
          value={String(data.counts.active)}
          detail="Con nutricion, entrenamiento o ambos"
        />
        <StatTile
          label="Solo nutricion"
          value={String(data.counts.nutrition)}
          detail="assigned_nutritionist_id"
        />
        <StatTile
          label="Solo entrenamiento"
          value={String(data.counts.training)}
          detail="assigned_trainer_id"
        />
      </section>

      <AppPanel
        title="Filtros"
        description="Las acciones disponibles tambien se validan en servidor."
        tone="primary"
      >
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter.value;

            return (
              <Link
                key={filter.value}
                href={`/app/clientes?filter=${filter.value}`}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-extrabold transition",
                  isActive
                    ? "border-primary bg-primary text-charcoal shadow-soft"
                    : "border-border bg-surface text-warm-brown hover:border-primary/40 hover:bg-primary-soft",
                )}
              >
                {filter.label}
                <span className="ml-2 text-xs opacity-70">
                  {data.counts[filter.value]}
                </span>
              </Link>
            );
          })}
        </div>
      </AppPanel>

      <AppPanel
        title="Cuentas"
        description="Cada cuenta conserva role client; la activacion se guarda en client_profiles."
      >
        {data.clients.length > 0 ? (
          <div className="space-y-4">
            {data.clients.map((client) => (
              <article
                key={client.id}
                className="rounded-[26px] border border-border bg-surface p-5 shadow-soft"
              >
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,1.2fr)] xl:items-start">
                  <div className="min-w-0 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-extrabold text-charcoal">
                            {client.fullName
                              .split(/\s+/)
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0]?.toUpperCase())
                              .join("") || "CL"}
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-extrabold text-charcoal">
                              {client.fullName}
                            </h2>
                            <p className="mt-1 truncate text-sm text-muted">
                              {client.email || "Email no disponible"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "w-fit rounded-full px-3 py-1 text-xs font-extrabold",
                          serviceTone(client),
                        )}
                      >
                        {serviceLabel(client)}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-border bg-background p-4">
                        <Clock className="size-4 text-warm-brown" />
                        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                          Registro
                        </p>
                        <p className="mt-1 font-bold text-charcoal">
                          {formatCreatedAt(client.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-[18px] border border-border bg-background p-4">
                        {client.isClientActivated ? (
                          <CheckCircle2 className="size-4 text-warm-brown" />
                        ) : (
                          <Users className="size-4 text-warm-brown" />
                        )}
                        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                          client_profiles
                        </p>
                        <p className="mt-1 font-bold text-charcoal">
                          {client.clientProfileExists
                            ? "Registro existente"
                            : "Sin registro"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-border bg-background p-4">
                        <Leaf className="size-4 text-warm-brown" />
                        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                          Nutricion
                        </p>
                        <p className="mt-1 font-bold text-charcoal">
                          {client.assignedNutritionistName ?? "No asignada"}
                        </p>
                      </div>
                      <div className="rounded-[18px] border border-border bg-background p-4">
                        <Dumbbell className="size-4 text-warm-brown" />
                        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                          Entrenamiento
                        </p>
                        <p className="mt-1 font-bold text-charcoal">
                          {client.assignedTrainerName ?? "No asignado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-muted">
                      {client.isClientActivated
                        ? "Editar asignacion"
                        : "Activar cliente"}
                    </h3>
                    <ClientActivationForm
                      canManageNutrition={data.canManageNutrition}
                      canManageTraining={data.canManageTraining}
                      client={client}
                      currentUserId={data.currentUserId}
                      nutritionists={data.nutritionists}
                      trainers={data.trainers}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>
            No hay cuentas que coincidan con este filtro o con tus permisos de
            especialidad.
          </EmptyState>
        )}
      </AppPanel>

      <AppPanel
        title="Profesionales disponibles"
        description="Los selects solo incluyen specialty nutrition/both o training/both segun corresponda."
        tone="accent"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
            <Leaf className="size-5 text-warm-brown" />
            <h2 className="mt-4 font-extrabold text-charcoal">
              Nutricionistas
            </h2>
            <p className="mt-2 text-sm text-muted">
              {data.nutritionists.length} disponibles
            </p>
          </div>
          <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
            <Dumbbell className="size-5 text-warm-brown" />
            <h2 className="mt-4 font-extrabold text-charcoal">
              Entrenadoras
            </h2>
            <p className="mt-2 text-sm text-muted">
              {data.trainers.length} disponibles
            </p>
          </div>
        </div>
      </AppPanel>
    </AppScreen>
  );
}
