"use client";

import { Loader2, Plus, Save, X } from "lucide-react";

import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
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
 <div>
 <Label htmlFor="habit-title">Nombre</Label>
 <Input
 id="habit-title"
 value={title}
 onChange={(event) => onTitleChange(event.target.value)}
 placeholder="Tomar 2L de agua"
 className="mt-2"
 />
 </div>
 <div>
 <Label htmlFor="habit-description">Descripción opcional</Label>
 <Textarea
 id="habit-description"
 value={description}
 onChange={(event) => onDescriptionChange(event.target.value)}
 className="mt-2"
 placeholder="Indicaciones breves para la clienta"
 />
 </div>
 <label className="flex min-h-11 items-center gap-3 rounded-[16px] bg-surface px-3 py-2 text-sm font-bold text-muted-foreground">
 <input
 type="checkbox"
 checked={active}
 onChange={(event) => onActiveChange(event.target.checked)}
 className="size-4 accent-primary"
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
