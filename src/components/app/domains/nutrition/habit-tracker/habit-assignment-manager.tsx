"use client";

import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import type {
 HabitAssignmentSummary,
 HabitSummary,
 NutritionHabitTrackerData,
} from "@/lib/habits/utils";

import { HabitAssignmentForm } from "./habit-assignment-form";
import { HabitAssignmentList } from "./habit-assignment-list";
import { useHabitAssignmentForm } from "./hooks/use-habit-assignment-form";

export function HabitAssignmentManager({
 assignments,
 clients,
 habits,
 selectedClientId,
 today,
}: {
 assignments: HabitAssignmentSummary[];
 clients: NutritionHabitTrackerData["clients"];
 habits: HabitSummary[];
 selectedClientId: string;
 today: string;
}) {
 const form = useHabitAssignmentForm({
 habits,
 selectedClientId,
 today,
 });

 if (clients.length === 0) {
 return (
 <Alert className="rounded-[18px] border-primary/25 bg-primary-soft">
 <AlertDescription className="font-semibold text-foreground">
 No hay clientas de nutrición disponibles para gestionar hábitos.
 Revisa las asignaciones activas antes de crear un seguimiento.
 </AlertDescription>
 </Alert>
 );
 }

 return (
 <div className="grid items-start gap-5 xl:grid-cols-[0.9fr_1.1fr]">
 <HabitAssignmentForm
 activeHabits={form.activeHabits}
 assignDisabledReason={form.assignDisabledReason}
 clientId={form.clientId}
 clients={clients}
 daysOfWeek={form.daysOfWeek}
 endDate={form.endDate}
 habitId={form.habitId}
 isPending={form.isPending}
 onClientChange={form.selectClient}
 onEndDateChange={form.setEndDate}
 onHabitChange={form.setHabitId}
 onStartDateChange={form.setStartDate}
 onSubmit={form.submit}
 onToggleDay={form.toggleDay}
 startDate={form.startDate}
 />

 <HabitAssignmentList
 assignments={assignments}
 isPending={form.isPending}
 onConfirm={form.setConfirmation}
 />

 <ConfirmationDialog
 open={Boolean(form.confirmation)}
 onOpenChange={(open) => {
 if (!open) form.setConfirmation(null);
 }}
 title={form.dialog.title}
 description={form.dialog.description}
 confirmLabel={form.dialog.confirmLabel}
 pendingLabel={form.dialog.pendingLabel}
 tone={form.dialog.tone}
 onConfirm={form.handleConfirm}
 />
 </div>
 );
}
