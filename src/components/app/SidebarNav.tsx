"use client";

import {
  Activity,
  BookOpen,
  CalendarDays,
  Dumbbell,
  Home,
  Leaf,
  MessageCircle,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  buildNavigationForUser,
  type AppNavIcon,
  type CurrentUserAccess,
} from "@/lib/auth/access-rules";
import { cn } from "@/lib/utils";

const iconMap: Record<AppNavIcon, LucideIcon> = {
  calendar: CalendarDays,
  clients: Users,
  dashboard: Home,
  messages: MessageCircle,
  nutrition: Leaf,
  pending: Sparkles,
  profile: Sparkles,
  progress: Activity,
  resources: BookOpen,
  settings: Settings,
  training: Dumbbell,
};

type SidebarNavProps = {
  access: CurrentUserAccess;
  collapsed: boolean;
  onNavigate?: () => void;
};

export function SidebarNav({ access, collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const sections = buildNavigationForUser(access);

  return (
    <nav className="space-y-7" aria-label="Navegacion principal">
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
              const Icon = iconMap[item.icon];
              const isActive =
                item.href === "/app/dashboard"
                  ? pathname === "/app" || pathname === "/app/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

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
