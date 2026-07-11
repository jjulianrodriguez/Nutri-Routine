"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { HabitAssignmentManager } from "./habit-tracker/habit-assignment-manager";
import { HabitCatalogManager } from "./habit-tracker/habit-catalog-manager";
import { HabitWeekGrid } from "./habit-tracker/habit-week-grid";
import { useHabitCompletionOverrides } from "./habit-tracker/hooks/use-habit-completion-overrides";
import { SelectedClientBanner } from "./habit-tracker/selected-client-banner";
import { TodayFocus } from "./habit-tracker/today-focus";
import type { HabitTrackerProps } from "./habit-tracker/types";

export function HabitTracker({
 data,
 isClient,
 showCatalog = false,
 showAssignments = false,
}: HabitTrackerProps) {
 const overrides = useHabitCompletionOverrides();
 const activeAssignments = data.assignments.filter((assignment) => assignment.active);
 const isManagementView = showCatalog || showAssignments;

 return (
 <div className="space-y-6">
 {!isManagementView && isClient ? (
 <TodayFocus
 assignments={activeAssignments}
 overrides={overrides}
 today={data.today}
 />
 ) : null}

 {!isManagementView && !isClient && data.selectedClient ? (
 <SelectedClientBanner client={data.selectedClient} />
 ) : null}

 {!isManagementView ? (
 <HabitWeekGrid
 assignments={activeAssignments}
 isClient={isClient}
 overrides={overrides}
 today={data.today}
 weekDays={data.weekDays}
 weekStart={data.weekStart}
 />
 ) : null}

 {!isClient && showCatalog && (
 <section className="h-fit self-start rounded-[28px] bg-surface/82 p-5 backdrop-blur-lg sm:p-6">
 <h2 className="text-2xl font-bold leading-tight text-foreground">
 Hábitos personalizados
 </h2>
 <p className="mt-2 text-sm leading-6 text-muted">
 Crea y mantiene los hábitos que luego asignas a clientas.
 </p>
 <div className="mt-5">
 <HabitCatalogManager habits={data.habits} />
 </div>
 </section>
 )}

 {!isClient && showAssignments && (
 <section className="h-fit self-start rounded-[28px] border-primary/30 bg-primary-soft/70 p-5 backdrop-blur-lg sm:p-6">
 <h2 className="text-2xl font-bold leading-tight text-foreground">
 Asignaciones
 </h2>
 <p className="mt-2 text-sm leading-6 text-muted">
 Define qué hábitos aplican para cada clienta y en qué días.
 </p>
 <div className="mt-5">
 {data.selectedClient ? (
 <HabitAssignmentManager
 assignments={data.assignments}
 clients={data.clients}
 habits={data.habits}
 selectedClientId={data.selectedClient.id}
 today={data.today}
 />
 ) : (
 <Alert className="rounded-[18px] border-primary/25 bg-surface">
 <AlertDescription className="font-semibold text-foreground">
 Selecciona o asigna una clienta de nutrición para empezar.
 </AlertDescription>
 </Alert>
 )}
 </div>
 </section>
 )}
 </div>
 );
}

