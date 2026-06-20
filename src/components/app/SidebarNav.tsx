"use client";

import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  Dumbbell,
  Home,
  Leaf,
  NotebookPen,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  nutrition: Leaf,
  notifications: Bell,
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
  unreadNotifications: number;
};

function SidebarLink({
  collapsed,
  href,
  icon: Icon,
  isActive,
  label,
  onNavigate,
  unreadCount = 0,
}: {
  collapsed: boolean;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onNavigate?: () => void;
  unreadCount?: number;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          onClick={onNavigate}
          className={cn(
            "relative flex h-11 min-w-0 items-center gap-3 rounded-control border px-3 text-sm font-bold transition-[background-color,border-color,color,box-shadow] duration-200",
            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
            collapsed && "mx-auto size-11 w-11 justify-center gap-0 px-0",
            isActive
              ? "border-primary/45 bg-primary-soft text-charcoal shadow-soft"
              : "border-transparent text-warm-brown hover:border-primary/25 hover:bg-surface/72 hover:text-charcoal hover:shadow-soft",
          )}
          aria-current={isActive ? "page" : undefined}
          aria-label={collapsed ? label : undefined}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          {!collapsed ? <span className="min-w-0 truncate">{label}</span> : null}
          {unreadCount > 0 ? (
            <span
              className={cn(
                "ml-auto grid min-w-5 place-items-center rounded-full bg-accent px-1.5 py-0.5 text-[0.65rem] font-extrabold leading-none text-charcoal",
                collapsed &&
                  "absolute -right-1 -top-1 ml-0 min-w-4 border-2 border-surface px-1",
              )}
              aria-label={`${unreadCount} notificaciones sin leer`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Link>
      </TooltipTrigger>
      {collapsed ? (
        <TooltipContent side="right">{label}</TooltipContent>
      ) : null}
    </Tooltip>
  );
}

export function SidebarNav({
  access,
  collapsed,
  onNavigate,
  unreadNotifications,
}: SidebarNavProps) {
  const pathname = usePathname();
  const sections = buildNavigationForUser(access);

  return (
    <nav
      className={cn("w-full min-w-0", collapsed ? "space-y-4" : "space-y-7")}
      aria-label="Navegacion principal"
    >
      {sections.map((section) => (
        <div key={section.label} className="min-w-0 space-y-2">
          {!collapsed ? (
            <p className="px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-muted">
              {section.label}
            </p>
          ) : null}

          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive =
                item.href === "/app/dashboard"
                  ? pathname === "/app" || pathname === "/app/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <SidebarLink
                  key={`${section.label}-${item.label}`}
                  collapsed={collapsed}
                  href={item.href}
                  icon={Icon}
                  isActive={isActive}
                  label={item.label}
                  onNavigate={onNavigate}
                  unreadCount={
                    item.route === "notifications"
                      ? unreadNotifications
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      ))}

      {access.role === "admin" ? (
        <div className="min-w-0 space-y-2">
          {!collapsed ? (
            <p className="px-3 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-muted">
              Contenido
            </p>
          ) : null}
          <SidebarLink
            collapsed={collapsed}
            href="/app/blog"
            icon={NotebookPen}
            isActive={
              pathname === "/app/blog" || pathname.startsWith("/app/blog/")
            }
            label="Blogs"
            onNavigate={onNavigate}
          />
        </div>
      ) : null}
    </nav>
  );
}
