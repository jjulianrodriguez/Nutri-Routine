import {
  Award,
  Calendar,
  CheckCircle2,
  Dumbbell,
  FileWarning,
  Leaf,
  TrendingUp,
  UserRound,
} from "lucide-react";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { NutritionClientSelector } from "@/components/app/nutrition-client-selector";
import { listClientActivationData } from "@/lib/actions/client-activation";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getNutritionHabitTrackerData } from "@/lib/habits/data";
import { getClientTrainingOverview } from "@/lib/routines/data";
import { isAssignmentApplicableOnDate } from "@/lib/habits/utils";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { HabitAssignmentSummary, HabitWeekDay } from "@/lib/habits/utils";

export const dynamic = "force-dynamic";

type ProgressPageProps = {
  searchParams?: Promise<{
    client?: string;
  }>;
};

// Streak helper: count consecutive days with at least one completed habit, starting from today going backward.
function getNutritionStreak(assignments: HabitAssignmentSummary[], weekDays: HabitWeekDay[]) {
  let streak = 0;
  const todayKey = weekDays.find(d => d.isToday)?.date || new Date().toISOString().slice(0, 10);
  
  // Sort weekdays descending to go backward from today
  const daysToCheck = [...weekDays]
    .filter(d => d.date <= todayKey)
    .sort((a, b) => b.date.localeCompare(a.date));
      
  for (const day of daysToCheck) {
    let dayCompletedAny = false;
    let dayHasApplicable = false;
    for (const assignment of assignments) {
      if (isAssignmentApplicableOnDate(assignment, day.date)) {
        dayHasApplicable = true;
        if (assignment.progressByDate[day.date]?.completed) {
          dayCompletedAny = true;
        }
      }
    }
    if (dayHasApplicable) {
      if (dayCompletedAny) {
        streak++;
      } else {
        break; // streak broken
      }
    }
  }
  return streak;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ProgressPage({
  searchParams,
}: ProgressPageProps) {
  const access = await requireRouteAccess("/app/progreso");
  const params = await searchParams;
  const supabase = await createClient();

  let targetClientId = access.userId;
  let clientsList: Array<{ id: string; fullName: string }> = [];

  // If professional/admin, resolve clients list and target client ID
  if (!access.isClient) {
    const activationData = await listClientActivationData("active", access);
    clientsList = activationData.clients.map((c) => ({
      id: c.id,
      fullName: c.fullName,
    }));

    targetClientId =
      params?.client && clientsList.some((c) => c.id === params.client)
        ? params.client
        : clientsList[0]?.id || "";
  }

  // Load target client service profiles
  const { data: clientProfile } = targetClientId
    ? await supabase
        .from("client_profiles")
        .select("assigned_nutritionist_id, assigned_trainer_id")
        .eq("profile_id", targetClientId)
        .maybeSingle()
    : { data: null };

  const hasNutrition = clientProfile?.assigned_nutritionist_id !== null;
  const hasTraining = clientProfile?.assigned_trainer_id !== null;

  // Load target client info
  const { data: profileRow } = targetClientId
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", targetClientId)
        .maybeSingle()
    : { data: null };
  const clientName = profileRow?.full_name || "Clienta";

  // Load nutrition progress data if applicable
  const habitData =
    targetClientId && hasNutrition
      ? await getNutritionHabitTrackerData(access, targetClientId)
      : null;

  // Load training progress data if applicable
  const trainingData =
    targetClientId && hasTraining
      ? await getClientTrainingOverview(targetClientId)
      : null;

  // Load target client's active meal plan document if applicable
  const { data: activeMealPlans } =
    targetClientId && hasNutrition
      ? await supabase
          .from("nutrition_documents")
          .select("id, title, file_name, created_at")
          .eq("client_id", targetClientId)
          .eq("document_type", "meal_plan")
          .eq("status", "active")
          .limit(1)
      : { data: null };
  const activeMealPlan = activeMealPlans?.[0] ?? null;

  // Load progress entries (metrics)
  const { data: progressEntries } = targetClientId
    ? await supabase
        .from("progress_entries")
        .select("id, area, metric_type, metric_value, metric_unit, note, recorded_at")
        .eq("client_id", targetClientId)
        .order("recorded_at", { ascending: false })
    : { data: null };

  const entriesCount = progressEntries?.length || 0;

  // Calculate nutrition statistics
  const habitStats = habitData?.stats || {
    completed: 0,
    total: 0,
    pending: 0,
    percentage: 0,
    markedDays: 0,
  };
  const habitStreak = habitData ? getNutritionStreak(habitData.assignments, habitData.weekDays) : 0;

  return (
    <AppScreen>
      <AppHeader
        eyebrow={access.isClient ? "Mi progreso" : "Área profesional"}
        title={access.isClient ? "Mi progreso" : "Progreso de clienta"}
        description={
          access.isClient
            ? "Visualiza tu evolución, cumplimiento de hábitos y avance en entrenamientos de forma combinada."
            : "Seguimiento unificado del avance de entrenamiento, nutrición y métricas de tus clientas."
        }
      />

      {/* Professional Client Selector */}
      {!access.isClient && clientsList.length > 0 && (
        <section className="rounded-[22px] border border-border bg-surface p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-soft">
          <div className="flex items-center gap-2 text-sm font-extrabold text-charcoal">
            <UserRound className="size-5 text-warm-brown" aria-hidden="true" />
            <span>Filtro de progreso por clienta</span>
          </div>
          <NutritionClientSelector
            clients={clientsList}
            selectedClientId={targetClientId}
            basePath="/app/progreso"
          />
        </section>
      )}

      {!targetClientId ? (
        <EmptyState>No hay clientas activas asignadas para supervisar.</EmptyState>
      ) : (
        <>
          {/* Main Grid tiles */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatTile
              label="Nutrición"
              value={hasNutrition ? "Activa" : "No asignada"}
              detail={
                hasNutrition
                  ? habitStats.total > 0
                    ? `${habitStats.percentage}% de cumplimiento`
                    : "Plan de alimentación activo"
                  : "Sin profesional de nutrición"
              }
            />
            <StatTile
              label="Entrenamiento"
              value={hasTraining ? "Activo" : "No asignado"}
              detail={
                hasTraining && trainingData?.currentAssignment
                  ? `Sesión ${trainingData.currentAssignment.completedDayCount} completada`
                  : "Sin plan de entrenamiento activo"
              }
            />
            <StatTile
              label="Métricas corporales"
              value={String(entriesCount)}
              detail="Registros de avance guardados"
            />
          </section>

          {/* Consolidated Progress Sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* 1. NUTRITION PROGRESS CARD */}
            {hasNutrition ? (
              <AppPanel
                title="Progreso de Nutrición"
                description={
                  access.isClient
                    ? "Tu evolución nutricional semanal y hábitos asignados."
                    : `Hábito y cumplimiento semanal de ${clientName}.`
                }
              >
                <div className="space-y-6">
                  {/* Habits Stats Display */}
                  <div className="rounded-[20px] border border-primary/20 bg-primary-soft/40 p-4 shadow-soft">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Cumplimiento Semanal</p>
                        <h4 className="mt-1 text-2xl font-black text-charcoal">
                          {habitStats.completed} de {habitStats.total} cumplidos
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-charcoal">{habitStats.percentage}%</span>
                      </div>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-300"
                        style={{ width: `${habitStats.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Streak and Meal Plan Badge */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-border bg-background p-4 flex items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-500">
                        <Award className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted">Racha semanal</p>
                        <p className="font-extrabold text-charcoal">{habitStreak} {habitStreak === 1 ? "día seguido" : "días seguidos"}</p>
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-border bg-background p-4 flex items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-warm-brown">
                        <Leaf className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-muted">Plan alimenticio</p>
                        {activeMealPlan ? (
                          <p className="font-extrabold text-charcoal truncate" title={activeMealPlan.title}>
                            {activeMealPlan.title}
                          </p>
                        ) : (
                          <p className="font-semibold text-muted text-sm">Sin plan asignado</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Habit Breakdown List */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-sm font-bold text-charcoal uppercase tracking-wider">Desglose de Hábitos</h5>
                    {habitData && habitData.assignments.length > 0 ? (
                      <div className="space-y-2">
                        {habitData.assignments.map((assignment) => {
                          const applicableDays = habitData.weekDays.filter((d) =>
                            isAssignmentApplicableOnDate(assignment, d.date)
                          );
                          const totalDaysCount = applicableDays.length;
                          const completedDaysCount = applicableDays.filter(
                            (d) => assignment.progressByDate[d.date]?.completed
                          ).length;
                          const completionPct =
                            totalDaysCount > 0
                              ? Math.round((completedDaysCount / totalDaysCount) * 100)
                              : 0;

                          return (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-charcoal truncate">{assignment.habit.title}</p>
                                <p className="text-xs text-muted">
                                  Meta: {completedDaysCount} de {totalDaysCount} días
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-1 text-xs font-extrabold",
                                  completionPct === 100
                                    ? "bg-primary-soft text-charcoal"
                                    : completionPct > 0
                                      ? "bg-amber-50 text-amber-600"
                                      : "bg-muted/10 text-muted"
                                )}
                              >
                                {completionPct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-border bg-background p-4 text-center text-sm text-muted">
                        No hay hábitos asignados para esta semana.
                      </div>
                    )}
                  </div>
                </div>
              </AppPanel>
            ) : (
              <div className="rounded-[28px] border border-dashed border-border bg-surface p-6 flex flex-col items-center justify-center text-center">
                <FileWarning className="size-8 text-muted mb-3" />
                <h4 className="font-extrabold text-charcoal">Sin Servicio de Nutrición</h4>
                <p className="mt-1 text-sm text-muted">
                  {access.isClient
                    ? "No tienes asignado un profesional de nutrición en tu plan."
                    : "Esta clienta no tiene un profesional de nutrición asignado en su ficha."}
                </p>
              </div>
            )}

            {/* 2. TRAINING PROGRESS CARD */}
            {hasTraining && trainingData ? (
              <AppPanel
                title="Progreso de Entrenamiento"
                description={
                  access.isClient
                    ? "Tu avance semanal y entrenamientos completados."
                    : `Rutinas y avance físico de ${clientName}.`
                }
                tone="accent"
              >
                <div className="space-y-6">
                  {/* Active Routine Info */}
                  {trainingData.currentAssignment ? (
                    <div className="space-y-4">
                      <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-xl bg-accent-soft text-warm-brown">
                            <Dumbbell className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted">Plan de entrenamiento activo</p>
                            <h4 className="font-black text-charcoal leading-tight">
                              {trainingData.currentAssignment.title}
                            </h4>
                          </div>
                        </div>
                        {trainingData.currentAssignment.description && (
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {trainingData.currentAssignment.description}
                          </p>
                        )}
                      </div>

                      {/* Training Progress stats */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[18px] border border-border bg-background p-4 flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-xl bg-accent-soft text-warm-brown">
                            <Calendar className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted">Duración</p>
                            <p className="font-extrabold text-charcoal">
                              {trainingData.currentAssignment.durationWeeks
                                ? `${trainingData.currentAssignment.durationWeeks} semanas`
                                : "Indefinido"}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-[18px] border border-border bg-background p-4 flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-xl bg-primary-soft text-charcoal">
                            <CheckCircle2 className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted">Completados</p>
                            <p className="font-extrabold text-charcoal">
                              {trainingData.currentAssignment.completedDayCount} entrenamientos
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Completed training logs */}
                      <div className="space-y-3 pt-2">
                        <h5 className="text-sm font-bold text-charcoal uppercase tracking-wider">Log de Rutinas</h5>
                        {trainingData.progress.length > 0 ? (
                          <div className="space-y-2">
                            {trainingData.progress.slice(0, 4).map((prog) => (
                              <div
                                key={prog.id}
                                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                              >
                                <div className="flex items-center gap-2.5">
                                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                                  <span className="font-bold text-sm text-charcoal">Día del ciclo {prog.cycleDay}</span>
                                </div>
                                <span className="text-xs font-bold text-muted tabular-nums">
                                  {formatDate(prog.workoutDate)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-[18px] border border-dashed border-border bg-background p-4 text-center text-sm text-muted">
                            Aún no se registran entrenamientos completados.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-border bg-background p-5 text-center text-sm text-muted">
                      No hay plan de entrenamiento activo asignado por ahora.
                    </div>
                  )}
                </div>
              </AppPanel>
            ) : (
              <div className="rounded-[28px] border border-dashed border-border bg-surface p-6 flex flex-col items-center justify-center text-center">
                <FileWarning className="size-8 text-muted mb-3" />
                <h4 className="font-extrabold text-charcoal">Sin Servicio de Entrenamiento</h4>
                <p className="mt-1 text-sm text-muted">
                  {access.isClient
                    ? "No tienes asignado un profesional de entrenamiento en tu plan."
                    : "Esta clienta no tiene un profesional de entrenamiento asignado en su ficha."}
                </p>
              </div>
            )}
          </div>

          {/* 3. METRICS / PROGRESS ENTRIES SECTION */}
          <AppPanel
            title="Registro de Avances (Métricas)"
            description={
              access.isClient
                ? "Historial de peso, grasa corporal y otras mediciones."
                : `Historial de avances y mediciones registradas de ${clientName}.`
            }
            tone="accent"
          >
            <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
              <TrendingUp className="size-5 text-warm-brown" />
              <h2 className="mt-4 font-extrabold text-charcoal">Avance Físico</h2>
              <div className="mt-4">
                {progressEntries && progressEntries.length > 0 ? (
                  <div className="space-y-3">
                    {progressEntries.map((record) => {
                      const value =
                        record.metric_value === null
                          ? null
                          : `${record.metric_value}${record.metric_unit ? ` ${record.metric_unit}` : ""}`;

                      return (
                        <article
                          key={record.id}
                          className="rounded-[20px] border border-border bg-background p-4"
                        >
                          <h4 className="font-extrabold text-charcoal">{record.metric_type}</h4>
                          {record.note ? (
                            <p className="mt-2 text-sm text-muted">{record.note}</p>
                          ) : null}
                          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.14em] text-warm-brown border-t border-border/40 pt-2">
                            <span>Valor: {value || "N/A"}</span>
                            <span>{formatDate(record.recorded_at)}</span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState>No hay registros de progreso todavía.</EmptyState>
                )}
              </div>
            </div>
          </AppPanel>
        </>
      )}
    </AppScreen>
  );
}
