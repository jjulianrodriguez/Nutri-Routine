"use client";

import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import type { HabitSummary } from "@/lib/habits/utils";

import { HabitCatalogForm } from "./habit-catalog-form";
import { HabitCatalogList } from "./habit-catalog-list";
import { useHabitCatalogForm } from "./hooks/use-habit-catalog-form";

export function HabitCatalogManager({ habits }: { habits: HabitSummary[] }) {
 const form = useHabitCatalogForm();

 return (
 <div className="grid items-start gap-5 xl:grid-cols-[0.9fr_1.1fr]">
 <HabitCatalogForm
 active={form.active}
 description={form.description}
 editing={form.editing}
 isPending={form.isPending}
 onActiveChange={form.setActive}
 onDescriptionChange={form.setDescription}
 onReset={form.resetForm}
 onSubmit={form.submit}
 onTitleChange={form.setTitle}
 title={form.title}
 />

 <HabitCatalogList
 habits={habits}
 isPending={form.isPending}
 onConfirm={form.setConfirmation}
 onEdit={form.editHabit}
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
