import {
  FileText,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  icon: React.ElementType;
  key: "plan" | "library" | "habits" | "assignments";
  label: string;
  adminOnly?: boolean;
};

const items: NavItem[] = [
  {
    href: "/app/nutricion",
    icon: FileText,
    key: "plan",
    label: "Plan de alimentación",
  },
  {
    href: "/app/nutricion/biblioteca",
    icon: BookOpen,
    key: "library",
    label: "Biblioteca educativa",
  },
  {
    href: "/app/nutricion/habitos",
    icon: CalendarDays,
    key: "habits",
    label: "Hábitos",
  },
  {
    href: "/app/nutricion/asignaciones",
    icon: ClipboardCheck,
    key: "assignments",
    label: "Asignaciones",
    adminOnly: true,
  },
];

export function NutritionSectionNav({
  active,
  canManage,
}: {
  active: "plan" | "library" | "habits" | "assignments";
  canManage: boolean;
}) {
  return (
    <nav
      aria-label="Secciones de nutrición"
      className="flex flex-wrap gap-2 rounded-[22px] border border-border bg-surface p-2 shadow-soft"
    >
      {items.map((item) => {
        if (item.adminOnly && !canManage) {
          return null;
        }

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
                ? "border-primary/30 bg-primary text-charcoal"
                : "border-transparent text-warm-brown hover:border-primary/20 hover:bg-primary-soft hover:text-charcoal",
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
