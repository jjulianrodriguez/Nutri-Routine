"use client";

import {
  Activity,
  Apple,
  BarChart3,
  BookOpen,
  CalendarDays,
  Dumbbell,
  FileDown,
  HeartPulse,
  Home,
  Leaf,
  MessageCircle,
  NotebookTabs,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type AppRole = "professional" | "client";

type SidebarNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type SidebarNavSection = {
  items: SidebarNavItem[];
  label: string;
};

const professionalSections: SidebarNavSection[] = [
  {
    label: "Gestión",
    items: [
      { href: "/app/dashboard", icon: Home, label: "Dashboard" },
      { href: "/app/dashboard#agenda", icon: CalendarDays, label: "Agenda" },
      { href: "/app/dashboard#clientes", icon: Users, label: "Clientes" },
      { href: "/app/dashboard#mensajes", icon: MessageCircle, label: "Mensajes" },
    ],
  },
  {
    label: "Planes",
    items: [
      { href: "/app/dashboard#nutricion", icon: Leaf, label: "Nutrición" },
      { href: "/app/dashboard#entrenamiento", icon: Dumbbell, label: "Entrenamiento" },
      { href: "/app/dashboard#seguimiento", icon: BarChart3, label: "Seguimiento" },
      { href: "/app/dashboard#recursos", icon: NotebookTabs, label: "Recursos" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/app/exportar", icon: FileDown, label: "Exportar" },
      { href: "/app/configuracion", icon: Settings, label: "Configuración" },
    ],
  },
];

const clientSections: SidebarNavSection[] = [
  {
    label: "Mi bienestar",
    items: [
      { href: "/app/dashboard", icon: Home, label: "Dashboard" },
      { href: "/app/dashboard#plan", icon: Apple, label: "Plan nutricional" },
      { href: "/app/dashboard#rutina", icon: Dumbbell, label: "Rutina" },
      { href: "/app/dashboard#progreso", icon: Activity, label: "Progreso" },
    ],
  },
  {
    label: "Acompañamiento",
    items: [
      { href: "/app/dashboard#citas", icon: CalendarDays, label: "Citas" },
      { href: "/app/dashboard#mensajes", icon: MessageCircle, label: "Mensajes" },
      { href: "/app/dashboard#recursos", icon: BookOpen, label: "Recursos" },
      { href: "/app/dashboard#habitos", icon: HeartPulse, label: "Hábitos" },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { href: "/app/dashboard#objetivos", icon: Sparkles, label: "Objetivos" },
      { href: "/app/configuracion", icon: Settings, label: "Configuración" },
    ],
  },
];

export function getSidebarSections(role: AppRole) {
  return role === "client" ? clientSections : professionalSections;
}

type SidebarNavProps = {
  collapsed: boolean;
  onNavigate?: () => void;
  role: AppRole;
};

export function SidebarNav({ collapsed, onNavigate, role }: SidebarNavProps) {
  const pathname = usePathname();
  const sections = getSidebarSections(role);

  return (
    <nav className="space-y-7" aria-label="Navegación principal">
      {sections.map((section) => (
        <div key={section.label} className="space-y-2">
          <p
            className={cn(
              "px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-muted transition-opacity duration-200",
              collapsed && "pointer-events-none opacity-0",
            )}
          >
            {section.label}
          </p>

          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const cleanHref = item.href.split("#")[0];
              const isActive =
                pathname === item.href ||
                (item.href === "/app/dashboard" && pathname === "/app/dashboard") ||
                (item.href !== "/app/dashboard" &&
                  !item.href.includes("#") &&
                  pathname.startsWith(cleanHref));

              return (
                <Link
                  key={`${section.label}-${item.label}`}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group/nav relative flex h-11 items-center gap-3 rounded-control border px-3 text-sm font-bold transition-all duration-200",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "border-primary/30 bg-primary text-charcoal shadow-soft"
                      : "border-transparent text-warm-brown hover:border-charcoal/10 hover:bg-primary-soft hover:text-charcoal",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span
                    className={cn(
                      "min-w-0 truncate transition-[opacity,transform,width] duration-200",
                      collapsed && "w-0 -translate-x-1 opacity-0",
                    )}
                  >
                    {item.label}
                  </span>
                  {collapsed ? (
                    <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-bold text-charcoal opacity-0 shadow-soft transition-opacity duration-150 group-hover/nav:opacity-100">
                      {item.label}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
