"use client";

import { Loader2, Plus, Save, X } from "lucide-react";

import { Button } from "@/components/ui/actions/button";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Textarea } from "@/components/ui/forms/textarea";
import type { HabitSummary } from "@/lib/habits/utils";

export function HabitCatalogForm({
 active,
 description,
 editing,
 isPending,
 onActiveChange,
 onDescriptionChange,
 onReset,
 onSubmit,
 onTitleChange,
 title,
}: {
 active: boolean;
 description: string;
 editing: HabitSummary | null;
 isPending: boolean;
 onActiveChange: (value: boolean) => void;
 onDescriptionChange: (value: string) => void;
 onReset: () => void;
 onSubmit: () => void;
 onTitleChange: (value: string) => void;
 title: string;
}) {
 return (
 <div className="h-fit self-start rounded-[22px] bg-background p-4">
 <h3 className="font-extrabold text-foreground">
 {editing ? "Editar hábito" : "Crear hábito"}
 </h3>
 <div className="mt-4 space-y-4">
 <FormField controlId="habit-title" label="Nombre">
 <Input
 value={title}
 onChange={(event) => onTitleChange(event.target.value)}
 placeholder="Tomar 2L de agua"
 />
 </FormField>
 <FormField controlId="habit-description" label="Descripción opcional">
 <Textarea
 value={description}
 onChange={(event) => onDescriptionChange(event.target.value)}
 placeholder="Indicaciones breves para la clienta"
 />
 </FormField>
 <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[16px] bg-surface px-3 py-2 text-sm font-bold text-muted-foreground">
 <Checkbox
 checked={active}
 onCheckedChange={(checked) => onActiveChange(checked === true)}
 />
 Hábito activo
 </label>
 <div className="flex flex-wrap gap-2">
 <Button type="button" onClick={onSubmit} disabled={isPending || !title.trim()}>
 {isPending ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : editing ? (
 <Save className="size-4" aria-hidden="true" />
 ) : (
 <Plus className="size-4" aria-hidden="true" />
 )}
 {editing ? "Guardar cambios" : "Crear hábito"}
 </Button>
 {editing ? (
 <Button type="button" variant="outline" onClick={onReset}>
 <X className="size-4" aria-hidden="true" />
 Cancelar
 </Button>
 ) : null}
 </div>
 </div>
 </div>
 );
}
