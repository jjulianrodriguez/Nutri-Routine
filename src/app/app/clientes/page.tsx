import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Dumbbell,
  Leaf,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { ClientAvatar } from "@/components/app/client-avatar";
import { ClientCardActions } from "@/components/app/client-card-actions";
import {
  getAssignedRelationBadge,
  RelationshipBadge,
  type RelationshipBadgeTone,
} from "@/components/app/relationship-badges";
import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listClientActivationData,
  type ClientAccountListItem,
} from "@/lib/actions/client-activation";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

type ClientsPageProps = {
  searchParams?: Promise<{
    filter?: string;
    plan?: string;
    professional?: string;
    q?: string;
    scope?: string;
    sort?: string;
    status?: string;
  }>;
};

type PlanFilter =
  | "all"
  | "any-active"
  | "both-active"
  | "nutrition-active"
  | "nutrition-inactive"
  | "training-active"
  | "training-inactive"
  | "without-plan";

type StatusFilter = "active" | "all" | "inactive";
type ScopeFilter = "own" | "visible";
type SortOption = "created-asc" | "created-desc" | "name" | "plan";

type SelectOption = {
  label: string;
  value: string;
};

type ProfessionalOption = SelectOption & {
  count: number;
};

const selectClasses =
  "mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-charcoal shadow-soft outline-none transition focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20";

function normalizeSearch(value?: string) {
  return value?.trim().slice(0, 80) ?? "";
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizePlanFilter(value?: string, legacyValue?: string): PlanFilter {
  const rawValue = value ?? legacyValue;

  if (
    rawValue === "all" ||
    rawValue === "any-active" ||
    rawValue === "both-active" ||
    rawValue === "nutrition-active" ||
    rawValue === "nutrition-inactive" ||
    rawValue === "training-active" ||
    rawValue === "training-inactive" ||
    rawValue === "without-plan"
  ) {
    return rawValue;
  }

  if (rawValue === "active") {
    return "any-active";
  }

  if (rawValue === "both") {
    return "both-active";
  }

  if (rawValue === "nutrition") {
    return "nutrition-active";
  }

  if (rawValue === "training") {
    return "training-active";
  }

  if (rawValue === "none" || rawValue === "pending") {
    return "without-plan";
  }

  return "all";
}

function normalizeStatusFilter(value?: string): StatusFilter {
  if (value === "active" || value === "inactive") {
    return value;
  }

  return "all";
}

function normalizeScopeFilter(
  value: string | undefined,
  isProfessional: boolean,
): ScopeFilter {
  if (isProfessional && value === "own") {
    return "own";
  }

  return "visible";
}

function normalizeSortOption(value?: string): SortOption {
  if (
    value === "created-asc" ||
    value === "created-desc" ||
    value === "name" ||
    value === "plan"
  ) {
    return value;
  }

  return "name";
}

function normalizeProfessionalFilter(
  value: string | undefined,
  options: ProfessionalOption[],
) {
  if (value === "unassigned") {
    return value;
  }

  if (value && options.some((option) => option.value === value)) {
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

function getClientPlanLabel(client: ClientAccountListItem) {
  if (client.hasNutritionService && client.hasTrainingService) {
    return "Ambos planes";
  }

  if (client.hasNutritionService) {
    return "Nutrición";
  }

  if (client.hasTrainingService) {
    return "Entrenamiento";
  }

  return "Sin plan activo";
}

function serviceTone(client: ClientAccountListItem): RelationshipBadgeTone {
  if (!client.isClientActivated) {
    return "muted";
  }

  if (client.hasNutritionService && client.hasTrainingService) {
    return "accent";
  }

  return "neutral";
}

function getClientSearchText(client: ClientAccountListItem) {
  const optionalPhone =
    (client as ClientAccountListItem & { phone?: string | null }).phone ?? "";

  return normalizeSearchText(
    [
      client.fullName,
      client.email,
      optionalPhone,
      client.id,
      client.assignedNutritionistName ?? "",
      client.assignedTrainerName ?? "",
    ].join(" "),
  );
}

function matchesPlanFilter(client: ClientAccountListItem, filter: PlanFilter) {
  switch (filter) {
    case "all":
      return true;
    case "any-active":
      return client.isClientActivated;
    case "both-active":
      return client.hasNutritionService && client.hasTrainingService;
    case "nutrition-active":
      return client.hasNutritionService;
    case "nutrition-inactive":
      return !client.hasNutritionService;
    case "training-active":
      return client.hasTrainingService;
    case "training-inactive":
      return !client.hasTrainingService;
    case "without-plan":
      return !client.isClientActivated;
  }
}

function matchesStatusFilter(client: ClientAccountListItem, filter: StatusFilter) {
  if (filter === "active") {
    return client.isClientActivated;
  }

  if (filter === "inactive") {
    return !client.isClientActivated;
  }

  return true;
}

function matchesScopeFilter(
  client: ClientAccountListItem,
  filter: ScopeFilter,
  currentUserId: string,
) {
  if (filter === "visible") {
    return true;
  }

  return (
    client.assignedNutritionistId === currentUserId ||
    client.assignedTrainerId === currentUserId
  );
}

function matchesProfessionalFilter(
  client: ClientAccountListItem,
  filter: string,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "unassigned") {
    return !client.assignedNutritionistId && !client.assignedTrainerId;
  }

  return (
    client.assignedNutritionistId === filter ||
    client.assignedTrainerId === filter
  );
}

function getPlanSortWeight(client: ClientAccountListItem) {
  if (client.hasNutritionService && client.hasTrainingService) {
    return 0;
  }

  if (client.hasNutritionService || client.hasTrainingService) {
    return 1;
  }

  return 2;
}

function sortClients(clients: ClientAccountListItem[], sort: SortOption) {
  return [...clients].sort((a, b) => {
    const nameComparison = a.fullName.localeCompare(b.fullName, "es", {
      sensitivity: "base",
    });

    if (sort === "name") {
      return nameComparison;
    }

    if (sort === "created-asc") {
      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
        nameComparison
      );
    }

    if (sort === "created-desc") {
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
        nameComparison
      );
    }

    return getPlanSortWeight(a) - getPlanSortWeight(b) || nameComparison;
  });
}

function buildProfessionalOptions(clients: ClientAccountListItem[]) {
  const options = new Map<string, ProfessionalOption>();

  function addProfessional(id: string | null, name: string | null) {
    if (!id) {
      return;
    }

    const current = options.get(id);

    if (current) {
      current.count += 1;
      return;
    }

    options.set(id, {
      count: 1,
      label: name ?? "Profesional sin nombre",
      value: id,
    });
  }

  for (const client of clients) {
    addProfessional(client.assignedNutritionistId, client.assignedNutritionistName);
    addProfessional(client.assignedTrainerId, client.assignedTrainerName);
  }

  return Array.from(options.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
  );
}

function getAssignedProfessionalSummary(client: ClientAccountListItem) {
  const sameProfessional =
    client.assignedNutritionistId &&
    client.assignedNutritionistId === client.assignedTrainerId;

  if (sameProfessional) {
    return `Ambos: ${
      client.assignedNutritionistName ??
      client.assignedTrainerName ??
      "Profesional sin nombre"
    }`;
  }

  const professionals = [
    client.assignedNutritionistId
      ? `Nutrición: ${client.assignedNutritionistName ?? "Profesional sin nombre"}`
      : null,
    client.assignedTrainerId
      ? `Entrenamiento: ${client.assignedTrainerName ?? "Profesional sin nombre"}`
      : null,
  ].filter(Boolean);

  return professionals.length > 0
    ? professionals.join(" · ")
    : "Sin profesional asignado";
}

function buildPlanOptions(counts: {
  active: number;
  all: number;
  both: number;
  none: number;
  nutritionActive: number;
  trainingActive: number;
}) {
  return [
    { label: `Todos (${counts.all})`, value: "all" },
    { label: `Clientes con plan activo (${counts.active})`, value: "any-active" },
    { label: `Plan de nutrición activo (${counts.nutritionActive})`, value: "nutrition-active" },
    {
      label: `Plan de nutrición inactivo (${counts.all - counts.nutritionActive})`,
      value: "nutrition-inactive",
    },
    { label: `Plan de entrenamiento activo (${counts.trainingActive})`, value: "training-active" },
    {
      label: `Plan de entrenamiento inactivo (${counts.all - counts.trainingActive})`,
      value: "training-inactive",
    },
    { label: `Ambos planes (${counts.both})`, value: "both-active" },
    { label: `Sin plan activo (${counts.none})`, value: "without-plan" },
  ] satisfies SelectOption[];
}

function SelectField({
  defaultValue,
  id,
  label,
  name,
  options,
}: {
  defaultValue: string;
  id: string;
  label: string;
  name: string;
  options: SelectOption[];
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted"
      >
        {label}
      </Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className={selectClasses}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ClientEmptyState({
  hasActiveFilters,
  hasAnyClients,
  isProfessional,
}: {
  hasActiveFilters: boolean;
  hasAnyClients: boolean;
  isProfessional: boolean;
}) {
  if (!hasAnyClients) {
    return (
      <EmptyState>
        <span className="block font-extrabold text-charcoal">
          {isProfessional
            ? "Todavía no tenés clientes asignados"
            : "No hay clientes visibles"}
        </span>
        <span className="mt-1 block">
          {isProfessional
            ? "Cuando tengas clientes vinculados a tu área, aparecerán en esta lista."
            : "Cuando existan cuentas cliente disponibles, aparecerán aquí."}
        </span>
      </EmptyState>
    );
  }

  return (
    <EmptyState>
      <span className="block font-extrabold text-charcoal">
        {hasActiveFilters
          ? "No encontramos clientes con esos filtros"
          : "No hay clientes visibles"}
      </span>
      <span className="mt-1 block">
        Ajusta la búsqueda, cambia los filtros o vuelve a la vista completa.
      </span>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href="/app/clientes">Ver todos los clientes</Link>
      </Button>
    </EmptyState>
  );
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const [access, params] = await Promise.all([
    requireRouteAccess("/app/clientes"),
    searchParams,
  ]);
  const data = await listClientActivationData("all", access);
  const clients = data.clients;
  const query = normalizeSearch(params?.q);
  const normalizedQuery = normalizeSearchText(query);
  const planFilter = normalizePlanFilter(params?.plan, params?.filter);
  const statusFilter = normalizeStatusFilter(params?.status);
  const scopeFilter = normalizeScopeFilter(params?.scope, data.isProfessional);
  const sortOption = normalizeSortOption(params?.sort);
  const professionalOptions = buildProfessionalOptions(clients);
  const professionalFilter = normalizeProfessionalFilter(
    params?.professional,
    professionalOptions,
  );
  const planOptions = buildPlanOptions(data.counts);
  const statusOptions = [
    { label: "Todos", value: "all" },
    { label: `Clientes con plan activo (${data.counts.active})`, value: "active" },
    { label: `Sin plan activo (${data.counts.none})`, value: "inactive" },
  ] satisfies SelectOption[];
  const scopeOptions = [
    {
      label: data.isAdmin ? "Todos los clientes visibles" : "Clientes visibles",
      value: "visible",
    },
    ...(data.isProfessional
      ? [{ label: "Mis clientes", value: "own" }]
      : []),
  ] satisfies SelectOption[];
  const sortOptions = [
    { label: "Nombre", value: "name" },
    { label: "Fecha de creación: recientes", value: "created-desc" },
    { label: "Fecha de creación: antiguos", value: "created-asc" },
    { label: "Estado de plan", value: "plan" },
  ] satisfies SelectOption[];
  const professionalSelectOptions = [
    { label: "Todos los profesionales", value: "all" },
    { label: "Sin profesional asignado", value: "unassigned" },
    ...professionalOptions.map((option) => ({
      label: `${option.label} (${option.count})`,
      value: option.value,
    })),
  ] satisfies SelectOption[];
  const filteredClients = sortClients(
    clients.filter((client) => {
      const matchesSearch =
        !normalizedQuery || getClientSearchText(client).includes(normalizedQuery);

      return (
        matchesSearch &&
        matchesPlanFilter(client, planFilter) &&
        matchesStatusFilter(client, statusFilter) &&
        matchesScopeFilter(client, scopeFilter, data.currentUserId) &&
        matchesProfessionalFilter(client, professionalFilter)
      );
    }),
    sortOption,
  );
  const hasActiveFilters =
    Boolean(query) ||
    planFilter !== "all" ||
    statusFilter !== "all" ||
    scopeFilter !== "visible" ||
    sortOption !== "name" ||
    professionalFilter !== "all";

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Clientes"
        title="Clientes"
        description="Gestiona clientes, planes y profesionales asignados desde una vista clara y compacta."
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

      <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Clientes visibles"
          value={String(data.counts.all)}
          detail="Cuentas cliente disponibles según tu rol"
        />
        <StatTile
          label="Clientes con plan activo"
          value={String(data.counts.active)}
          detail="Nutrición, entrenamiento o ambos"
        />
        <StatTile
          label="Plan de nutrición activo"
          value={String(data.counts.nutritionActive)}
          detail="Clientes con acceso a nutrición"
        />
        <StatTile
          label="Plan de entrenamiento activo"
          value={String(data.counts.trainingActive)}
          detail="Clientes con acceso a entrenamiento"
        />
      </section>

      <AppPanel
        title="Buscar y filtrar"
        description="Encuentra clientes por nombre, correo o ID visible y reduce la lista sin abrir cada ficha."
        tone="primary"
      >
        <form action="/app/clientes" className="space-y-4">
          <div>
            <Label
              htmlFor="client-search"
              className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted"
            >
              Buscar clientes
            </Label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <Input
                id="client-search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Nombre, correo o ID visible"
                className="h-12 rounded-control pl-10 font-semibold"
              />
            </div>
          </div>

          <details
            open
            className="group rounded-[22px] border border-border bg-surface/70 shadow-soft"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-extrabold text-charcoal outline-none transition hover:bg-primary-soft/50 focus-visible:ring-3 focus-visible:ring-primary/20 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filtros y orden
              </span>
              <span className="text-xs text-muted">
                {hasActiveFilters ? "Filtros aplicados" : "Vista completa"}
              </span>
            </summary>
            <div className="grid items-start gap-3 border-t border-border px-4 py-4 sm:grid-cols-2 xl:grid-cols-5">
              <SelectField
                defaultValue={planFilter}
                id="plan-filter"
                label="Planes"
                name="plan"
                options={planOptions}
              />
              <SelectField
                defaultValue={statusFilter}
                id="status-filter"
                label="Estado"
                name="status"
                options={statusOptions}
              />
              <SelectField
                defaultValue={professionalFilter}
                id="professional-filter"
                label="Profesional"
                name="professional"
                options={professionalSelectOptions}
              />
              <SelectField
                defaultValue={scopeFilter}
                id="scope-filter"
                label="Alcance"
                name="scope"
                options={scopeOptions}
              />
              <SelectField
                defaultValue={sortOption}
                id="sort-filter"
                label="Orden"
                name="sort"
                options={sortOptions}
              />
            </div>
          </details>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" className="sm:w-auto">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Aplicar filtros
            </Button>
            <Button asChild variant="outline" size="lg" className="sm:w-auto">
              <Link href="/app/clientes">Limpiar</Link>
            </Button>
          </div>
        </form>
      </AppPanel>

      <AppPanel
        title="Clientes visibles"
        description={
          data.isAdmin
            ? "Vista compacta para abrir el detalle y gestionar planes desde una pantalla dedicada."
            : "Vista compacta de clientes disponibles según tu área y permisos."
        }
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-muted">
            Mostrando {filteredClients.length} de {clients.length} clientes
          </p>
          {hasActiveFilters ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/app/clientes">Ver todos los clientes</Link>
            </Button>
          ) : null}
        </div>

        {filteredClients.length > 0 ? (
          <div className="space-y-3">
            {filteredClients.map((client) => {
              const canViewClientProfile =
                data.isAdmin ||
                client.assignedNutritionistId === data.currentUserId ||
                client.assignedTrainerId === data.currentUserId;
              const canManagePlans =
                canViewClientProfile &&
                (data.canManageNutrition || data.canManageTraining);
              const nutritionRelationBadge = getAssignedRelationBadge({
                assignedId: client.hasNutritionService
                  ? client.assignedNutritionistId
                  : null,
                currentUserId: data.currentUserId,
                isAdmin: data.isAdmin,
                isProfessional: data.isProfessional,
              });
              const trainingRelationBadge = getAssignedRelationBadge({
                assignedId: client.hasTrainingService
                  ? client.assignedTrainerId
                  : null,
                currentUserId: data.currentUserId,
                isAdmin: data.isAdmin,
                isProfessional: data.isProfessional,
              });

              return (
                <article
                  key={client.id}
                  className="rounded-[22px] border border-border bg-surface/88 px-4 py-4 shadow-soft"
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(14rem,0.8fr)_auto] lg:items-center">
                    <div className="flex min-w-0 items-start gap-3">
                      {canViewClientProfile ? (
                        <Link
                          href={`/app/clientes/${client.id}`}
                          aria-label={`Ver cliente ${client.fullName}`}
                          className="shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                        >
                          <ClientAvatar
                            name={client.fullName}
                            src={client.avatarUrl}
                          />
                        </Link>
                      ) : (
                        <ClientAvatar
                          name={client.fullName}
                          src={client.avatarUrl}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {canViewClientProfile ? (
                            <Link
                              href={`/app/clientes/${client.id}`}
                              className="min-w-0 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                            >
                              <h2 className="truncate text-lg font-extrabold text-charcoal transition hover:text-warm-brown">
                                {client.fullName}
                              </h2>
                            </Link>
                          ) : (
                            <h2 className="truncate text-lg font-extrabold text-charcoal">
                              {client.fullName}
                            </h2>
                          )}
                          <RelationshipBadge
                            tone={client.isClientActivated ? "success" : "muted"}
                          >
                            {client.isClientActivated ? (
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
                            {client.isClientActivated ? "Activo" : "Inactivo"}
                          </RelationshipBadge>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted">
                          {client.email || "Correo no disponible"}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-warm-brown">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              className="size-3.5"
                              aria-hidden="true"
                            />
                            Registro: {formatCreatedAt(client.createdAt)}
                          </span>
                          <span>ID: {client.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <RelationshipBadge tone={serviceTone(client)}>
                          {getClientPlanLabel(client)}
                        </RelationshipBadge>
                        {client.hasNutritionService ? (
                          <RelationshipBadge tone="primary">
                            <Leaf className="size-3.5" aria-hidden="true" />
                            Nutrición
                          </RelationshipBadge>
                        ) : null}
                        {client.hasTrainingService ? (
                          <RelationshipBadge tone="primary">
                            <Dumbbell className="size-3.5" aria-hidden="true" />
                            Entrenamiento
                          </RelationshipBadge>
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                          Profesional asignado
                        </p>
                        <p className="mt-1 truncate text-sm font-bold text-charcoal">
                          {getAssignedProfessionalSummary(client)}
                        </p>
                      </div>
                      {!data.isAdmin && data.isProfessional ? (
                        <div className="flex flex-wrap gap-2">
                          {client.hasNutritionService ? (
                            <RelationshipBadge tone={nutritionRelationBadge.tone}>
                              Nutrición: {nutritionRelationBadge.label}
                            </RelationshipBadge>
                          ) : null}
                          {client.hasTrainingService ? (
                            <RelationshipBadge tone={trainingRelationBadge.tone}>
                              Entrenamiento: {trainingRelationBadge.label}
                            </RelationshipBadge>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 lg:justify-end">
                      {canViewClientProfile ? (
                        <Button asChild size="sm" className="flex-1 sm:flex-none">
                          <Link href={`/app/clientes/${client.id}`}>
                            Ver cliente
                            <ArrowRight className="size-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      ) : (
                        <span className="rounded-full border border-border bg-background px-3 py-2 text-xs font-extrabold text-muted">
                          Sin acceso al detalle
                        </span>
                      )}
                      <ClientCardActions
                        canAssignProfessional={data.isAdmin && canManagePlans}
                        canManagePlans={canManagePlans}
                        clientId={client.id}
                        clientName={client.fullName}
                        isClientActivated={client.isClientActivated}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <ClientEmptyState
            hasActiveFilters={hasActiveFilters}
            hasAnyClients={clients.length > 0}
            isProfessional={data.isProfessional}
          />
        )}
      </AppPanel>

      <AppPanel
        title="Profesionales disponibles"
        description="Referencia rápida para asignaciones desde el detalle del cliente."
        tone="accent"
      >
        <div className="grid items-start gap-3 md:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-[18px] border border-charcoal/10 bg-surface px-4 py-3">
            <span className="inline-flex items-center gap-2 font-extrabold text-charcoal">
              <Leaf className="size-5 text-warm-brown" aria-hidden="true" />
              Nutrición
            </span>
            <span className="text-sm font-bold text-muted">
              {data.nutritionists.length} disponibles
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-[18px] border border-charcoal/10 bg-surface px-4 py-3">
            <span className="inline-flex items-center gap-2 font-extrabold text-charcoal">
              <Dumbbell className="size-5 text-warm-brown" aria-hidden="true" />
              Entrenamiento
            </span>
            <span className="text-sm font-bold text-muted">
              {data.trainers.length} disponibles
            </span>
          </div>
        </div>
      </AppPanel>
    </AppScreen>
  );
}
