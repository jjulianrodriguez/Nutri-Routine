import {
 Dumbbell,
 Layers3,
 Leaf,
 type LucideIcon,
} from "lucide-react";

import type {
 ResourceArea,
 ResourceContentFilter,
 ResourceFilter,
 ResourceStatusFilter,
} from "./types";

export const selectClasses =
  "mt-2 h-11 w-full min-w-0 rounded-control bg-surface px-4 py-2 text-base text-foreground transition-[background-color,border-color,box-shadow,color,transform] outline-none placeholder:text-muted-foreground ring-2 ring-primary/30 focus:bg-primary-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-danger/40 aria-invalid:bg-danger/10 md:text-sm dark:ring-primary/40 dark:focus:bg-primary-soft appearance-none";

export const AREA_DETAILS: Record<
 ResourceArea,
 { icon: LucideIcon; label: string; summary: string }
> = {
 general: {
 icon: Layers3,
 label: "Compartido",
 summary: "Disponible para nutricion y entrenamiento",
 },
 nutrition: {
 icon: Leaf,
 label: "Nutricion",
 summary: "Solo plan de nutricion",
 },
 training: {
 icon: Dumbbell,
 label: "Entrenamiento",
 summary: "Solo plan de entrenamiento",
 },
};

export const FILTERS: Array<{ label: string; value: ResourceFilter }> = [
 { label: "Todos", value: "all" },
 { label: "Entrenamiento", value: "training" },
 { label: "Nutricion", value: "nutrition" },
 { label: "Compartido", value: "general" },
];

export const CONTENT_FILTERS: Array<{
 label: string;
 value: ResourceContentFilter;
}> = [
 { label: "Todos", value: "all" },
 { label: "PDFs", value: "pdf" },
 { label: "Enlaces", value: "links" },
 { label: "Carpetas", value: "folders" },
];

export const STATUS_FILTERS: Array<{
 label: string;
 value: ResourceStatusFilter;
}> = [
 { label: "Todos", value: "all" },
 { label: "Activos", value: "active" },
 { label: "Inactivos", value: "inactive" },
];
