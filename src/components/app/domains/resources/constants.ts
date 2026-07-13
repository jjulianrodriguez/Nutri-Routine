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
