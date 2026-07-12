import { BarChart3, Dumbbell, Scale, Utensils } from "lucide-react";
import type { ElementType } from "react";

import { SectionTabs } from "@/components/app/shared/section-tabs";
import type { ProgressTab } from "@/lib/progress/data";

import { hrefForTab } from "./utils";

const progressTabs: Array<{
 id: ProgressTab;
 icon: ElementType;
 label: string;
}> = [
 { id: "resumen", icon: BarChart3, label: "Resumen" },
 { id: "nutricion", icon: Utensils, label: "Nutricion" },
 { id: "entrenamiento", icon: Dumbbell, label: "Entrenamiento" },
 { id: "medidas", icon: Scale, label: "Medidas" },
];

export function ProgressTabs({
 activeTab,
 selectedClientId,
}: {
 activeTab: ProgressTab;
 selectedClientId: string | null;
}) {
 return (
 <SectionTabs
 activeId={activeTab}
 ariaLabel="Secciones de progreso"
 className="grid gap-2 sm:grid-cols-4"
 items={progressTabs.map((tab) => ({
 href: hrefForTab(tab.id, selectedClientId),
 icon: tab.icon,
 id: tab.id,
 label: tab.label,
 }))}
 />
 );
}