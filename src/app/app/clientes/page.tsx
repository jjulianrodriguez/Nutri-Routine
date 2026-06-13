import {
  CheckCircle2,
  CircleOff,
  Clock,
  Dumbbell,
  Leaf,
  ArrowRight,
  Users,
} from "lucide-react";
import Link from "next/link";

import { ClientActivationForm } from "@/components/app/client-activation-form";
import { ClientAvatar } from "@/components/app/client-avatar";
import { ClientCardActions } from "@/components/app/client-card-actions";
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
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Sin planes", value: "none" },
  { label: "Solo nutricion", value: "nutrition" },
  { label: "Solo entrenamiento", value: "training" },
  { label: "Ambos planes", value: "both" },
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

  return "all";
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

  return "Sin planes activos";
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
        eyebrow="Administracion de usuarios"
        title="Usuarios y planes activos"
        description="Consulta las cuentas registradas y controla de forma independiente el acceso a nutricion y entrenamiento."
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
          label="Usuarios registrados"
          value={String(data.counts.all)}
          detail="Cuentas registradas con rol cliente"
        />
        <StatTile
          label="Usuarios activos"
          value={String(data.counts.active)}
          detail="Con al menos un plan activo"
        />
        <StatTile
          label="Nutricion activa"
          value={String(data.counts.nutritionActive)}
          detail="Incluye usuarios con ambos planes"
        />
        <StatTile
          label="Entrenamiento activo"
          value={String(data.counts.trainingActive)}
          detail="Incluye usuarios con ambos planes"
        />
      </section>

      <AppPanel
        title="Filtros"
        description="Filtra por el estado actual de cada cuenta."
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
        title="Usuarios registrados"
        description="Los planes determinan que secciones puede abrir cada cliente dentro de la app."
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
                          <Link
                            href={`/app/clientes/${client.id}`}
                            aria-label={`Ver perfil de ${client.fullName}`}
                          >
                            <ClientAvatar
                              name={client.fullName}
                              src={client.avatarUrl}
                            />
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/app/clientes/${client.id}`}
                              className="group block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                            >
                              <h2 className="truncate text-lg font-extrabold text-charcoal transition group-hover:text-warm-brown">
                                {client.fullName}
                              </h2>
                              <p className="mt-1 truncate text-sm text-muted">
                                {client.email || "Correo no disponible"}
                              </p>
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-fit rounded-full px-3 py-1 text-xs font-extrabold",
                            serviceTone(client),
                          )}
                        >
                          {serviceLabel(client)}
                        </span>
                        <ClientCardActions
                          canManagePlans={
                            data.canManageNutrition || data.canManageTraining
                          }
                          clientId={client.id}
                          clientName={client.fullName}
                        />
                      </div>
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
                          Estado de cuenta
                        </p>
                        <p className="mt-1 font-bold text-charcoal">
                          {client.clientProfileExists
                            ? "Planes configurables"
                            : "Sin planes configurados"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div
                        className={cn(
                          "rounded-[18px] border p-4",
                          client.hasNutritionService
                            ? "border-primary/35 bg-primary-soft/60"
                            : "border-border bg-background",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <Leaf className="size-4 text-warm-brown" />
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-extrabold text-charcoal">
                            {client.hasNutritionService ? (
                              <CheckCircle2
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            ) : (
                              <CircleOff
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            )}
                            {client.hasNutritionService ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                          Nutricion
                        </p>
                        <p className="mt-1 font-bold text-charcoal">
                          {client.assignedNutritionistName ?? "No asignada"}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "rounded-[18px] border p-4",
                          client.hasTrainingService
                            ? "border-primary/35 bg-primary-soft/60"
                            : "border-border bg-background",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <Dumbbell className="size-4 text-warm-brown" />
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-extrabold text-charcoal">
                            {client.hasTrainingService ? (
                              <CheckCircle2
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            ) : (
                              <CircleOff
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            )}
                            {client.hasTrainingService ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                          Entrenamiento
                        </p>
                        <p className="mt-1 font-bold text-charcoal">
                          {client.assignedTrainerName ?? "No asignado"}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/app/clientes/${client.id}`}
                      className="inline-flex items-center gap-2 text-sm font-extrabold text-warm-brown transition hover:text-charcoal"
                    >
                      Ver perfil completo
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <div id={`planes-${client.id}`} className="scroll-mt-6">
                    <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-muted">
                      {client.isClientActivated
                        ? "Gestionar planes"
                        : "Activar planes"}
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
            No hay usuarios que coincidan con este filtro.
          </EmptyState>
        )}
      </AppPanel>

      <AppPanel
        title="Profesionales disponibles"
        description="Cada plan activo requiere una profesional compatible asignada."
        tone="accent"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
            <Leaf className="size-5 text-warm-brown" />
            <h2 className="mt-4 font-extrabold text-charcoal">
              Profesionales en nutricion
            </h2>
            <p className="mt-2 text-sm text-muted">
              {data.nutritionists.length} disponibles
            </p>
          </div>
          <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
            <Dumbbell className="size-5 text-warm-brown" />
            <h2 className="mt-4 font-extrabold text-charcoal">
              Profesionales en entrenamiento
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
