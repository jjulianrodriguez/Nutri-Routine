"use client";

import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
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
import { useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  buildNavigationForUser,
  type AppNavIcon,
  type AppNavigationSubItem,
  type CurrentUserAccess,
} from "@/lib/auth/access-rules";
import { cn } from "@/lib/utils";

const iconMap: Record<AppNavIcon, LucideIcon> = {
  blog: NotebookPen,
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
  hasSubItems = false,
  icon: Icon,
  isActive,
  label,
  onNavigate,
  subItems,
  unreadCount = 0,
}: {
  collapsed: boolean;
  hasSubItems?: boolean;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onNavigate?: () => void;
  subItems?: AppNavigationSubItem[];
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
            !collapsed && hasSubItems && "flex-1",
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
        <TooltipContent side="right">
          <div className="space-y-1">
            <p>{label}</p>
            {subItems?.length ? (
              <div className="space-y-0.5 border-t border-border pt-1 text-xs font-semibold text-muted">
                {subItems.map((subItem) => (
                  <p key={subItem.href}>{subItem.label}</p>
                ))}
              </div>
            ) : null}
          </div>
        </TooltipContent>
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
  const [currentHash, setCurrentHash] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const sections = buildNavigationForUser(access);
  const currentHref = `${pathname}${currentHash}`;

  useEffect(() => {
    const syncHash = () => {
      setCurrentHash(window.location.hash);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  const toggleExpandedItem = (itemKey: string) => {
    setExpandedItems((current) => ({
      ...current,
      [itemKey]: !current[itemKey],
    }));
  };

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
              const hasSubItems = Boolean(item.subItems?.length);
              const hasActiveSubItem =
                item.subItems?.some((subItem) => subItem.href === currentHref) ??
                false;
              const isActive =
                item.href === "/app/dashboard"
                  ? pathname === "/app" || pathname === "/app/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`) ||
                    hasActiveSubItem;
              const itemKey = `${section.label}-${item.route}`;
              const isExpanded =
                !collapsed &&
                hasSubItems &&
                (expandedItems[itemKey] || hasActiveSubItem);
              const subNavId = `sidebar-subnav-${item.route}`;

              return (
                <div key={`${section.label}-${item.label}`} className="min-w-0">
                  <div
                    className={cn(
                      !collapsed && hasSubItems && "flex items-center gap-1",
                    )}
                  >
                    <SidebarLink
                      collapsed={collapsed}
                      hasSubItems={hasSubItems}
                      href={item.href}
                      icon={Icon}
                      isActive={isActive}
                      label={item.label}
                      onNavigate={onNavigate}
                      subItems={item.subItems}
                      unreadCount={
                        item.route === "notifications"
                          ? unreadNotifications
                          : undefined
                      }
                    />
                    {!collapsed && hasSubItems ? (
                      <button
                        type="button"
                        className={cn(
                          "grid size-11 shrink-0 place-items-center rounded-control border border-transparent text-muted transition-[background-color,border-color,color] duration-200",
                          "hover:border-primary/25 hover:bg-surface/72 hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                          isExpanded && "text-warm-brown",
                        )}
                        aria-controls={subNavId}
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Contraer" : "Expandir"} ${item.label}`}
                        onClick={() => toggleExpandedItem(itemKey)}
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform duration-200",
                            isExpanded && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ) : null}
                  </div>
                  {!collapsed && hasSubItems && isExpanded ? (
                    <div
                      id={subNavId}
                      className="ml-5 mt-1 space-y-1 border-l border-border/80 pl-3"
                    >
                      {item.subItems?.map((subItem) => {
                        const isSubItemActive = subItem.href === currentHref;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={onNavigate}
                            className={cn(
                              "block rounded-[12px] px-3 py-1.5 text-xs font-extrabold text-muted transition-colors",
                              "hover:bg-surface/72 hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                              isSubItemActive &&
                                "bg-primary-soft/70 text-charcoal",
                              !isSubItemActive && isActive && "text-warm-brown",
                            )}
                            aria-current={isSubItemActive ? "page" : undefined}
                          >
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
