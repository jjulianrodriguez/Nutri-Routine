import {
 CalendarDays,
 ClipboardCheck,
 Dumbbell,
 FileText,
 Layers3,
 LayoutGrid,
 ListChecks,
} from "lucide-react";

import type { SectionTabItem } from "@/components/app/section-tabs";

export type TrainingSectionTab =
 | "assignments"
 | "exercises"
 | "overview"
 | "routines"
 | "templates";

export const trainingSectionTabs: SectionTabItem<TrainingSectionTab>[] = [
 {
 href: "/app/entrenamiento",
 icon: LayoutGrid,
 id: "overview",
 label: "Resumen",
 },
 {
 href: "/app/entrenamiento/ejercicios",
 icon: Dumbbell,
 id: "exercises",
 label: "Ejercicios",
 },
 {
 href: "/app/entrenamiento/rutinas",
 icon: ListChecks,
 id: "routines",
 label: "Entrenamientos",
 },
 {
 href: "/app/entrenamiento/plantillas",
 icon: Layers3,
 id: "templates",
 label: "Plantillas",
 },
 {
 href: "/app/entrenamiento/asignaciones",
 icon: ClipboardCheck,
 id: "assignments",
 label: "Asignaciones",
 },
];

export type NutritionSectionTab = "assignments" | "habits" | "plan";

export type NutritionSectionTabItem = SectionTabItem<NutritionSectionTab> & {
 adminOnly?: boolean;
};

export const nutritionSectionTabs: NutritionSectionTabItem[] = [
 {
 href: "/app/nutricion",
 icon: FileText,
 id: "plan",
 label: "Plan de alimentacion",
 },
 {
 href: "/app/nutricion/habitos",
 icon: CalendarDays,
 id: "habits",
 label: "Habitos",
 },
 {
 adminOnly: true,
 href: "/app/nutricion/asignaciones",
 icon: ClipboardCheck,
 id: "assignments",
 label: "Asignaciones",
 },
];
