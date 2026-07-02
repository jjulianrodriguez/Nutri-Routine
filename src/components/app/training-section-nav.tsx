import {
  ClipboardCheck,
  Dumbbell,
  Layers3,
  LayoutGrid,
  ListChecks,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const items = [
  {
    href: "/app/entrenamiento",
    icon: LayoutGrid,
    key: "overview",
    label: "Resumen",
  },
  {
    href: "/app/entrenamiento/ejercicios",
    icon: Dumbbell,
    key: "exercises",
    label: "Ejercicios",
  },
  {
    href: "/app/entrenamiento/rutinas",
    icon: ListChecks,
    key: "routines",
    label: "Entrenamientos",
  },
  {
    href: "/app/entrenamiento/plantillas",
    icon: Layers3,
    key: "templates",
    label: "Plantillas",
  },
  {
    href: "/app/entrenamiento/asignaciones",
    icon: ClipboardCheck,
    key: "assignments",
    label: "Asignaciones",
  },
] as const;

export function TrainingSectionNav({
  active,
}: {
  active: (typeof items)[number]["key"];
}) {
  return (
    <nav
      aria-label="Secciones de entrenamiento"
      className="flex flex-wrap gap-2 rounded-[22px] border border-border bg-surface p-2 shadow-soft"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === active;

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-control border px-4 text-sm font-extrabold transition-colors",
              isActive
                ? "border-primary/30 bg-primary text-white"
                : "border-transparent text-muted-foreground hover:border-primary/20 hover:bg-primary-soft hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
