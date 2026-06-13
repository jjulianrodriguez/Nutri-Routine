"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { CurrentUserAccessProvider } from "@/components/app/current-user-access-provider";
import { SidebarNav } from "@/components/app/SidebarNav";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nce-app-sidebar-collapsed";

type SidebarProps = {
  access: CurrentUserAccess;
  children: ReactNode;
};

function ProfileBlock({
  collapsed,
  displayName,
  email,
  initials,
  roleLabel,
}: {
  collapsed: boolean;
  displayName: string;
  email?: string;
  initials: string;
  roleLabel: string;
}) {
  const profile = (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-[22px] border border-primary/25 bg-primary-soft p-3 shadow-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
        !collapsed && "pr-14 lg:pr-3",
        collapsed && "mx-auto size-12 justify-center rounded-full p-0",
      )}
      tabIndex={collapsed ? 0 : undefined}
      aria-label={
        collapsed ? `Perfil activo: ${displayName}, ${roleLabel}` : undefined
      }
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-extrabold text-charcoal">
        {initials}
      </div>
      {!collapsed ? (
        <div className="min-w-0">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-muted">
            Perfil activo
          </p>
          <p className="mt-1 truncate text-sm font-extrabold text-charcoal">
            {displayName}
          </p>
          <p className="truncate text-xs text-muted">{email || roleLabel}</p>
          {email ? (
            <p className="truncate text-xs font-bold text-warm-brown">
              {roleLabel}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (!collapsed) {
    return profile;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{profile}</TooltipTrigger>
      <TooltipContent side="right">
        <p>{displayName}</p>
        <p className="font-semibold text-muted">{roleLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar({
  access,
  children,
}: SidebarProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { displayName, email, initials, roleLabel } = access;

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const frame = window.requestAnimationFrame(() => {
        setCollapsed(stored === "true");
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  function renderSidebarContent(isCollapsed: boolean) {
    return (
      <TooltipProvider>
        <div className="flex h-full min-w-0 flex-col overflow-x-hidden">
          <div
            className={cn(
              "relative border-b border-border py-4",
              isCollapsed ? "px-3" : "px-4",
            )}
          >
            <ProfileBlock
              collapsed={isCollapsed}
              displayName={displayName}
              email={email}
              initials={initials}
              roleLabel={roleLabel}
            />
            <button
              type="button"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-border bg-surface text-warm-brown shadow-soft transition-colors hover:bg-primary-soft hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar navegación"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div
            className={cn(
              "min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto py-5 no-scrollbar",
              isCollapsed ? "px-3" : "px-4",
            )}
          >
            <SidebarNav
              access={access}
              collapsed={isCollapsed}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>

          <div
            className={cn(
              "border-t border-border py-4",
              isCollapsed ? "flex justify-center px-3" : "px-4",
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={cn(
                    "flex h-11 min-w-0 items-center justify-center gap-3 rounded-control border border-border bg-surface text-sm font-extrabold text-warm-brown shadow-soft transition-[background-color,border-color,color] hover:border-primary/30 hover:bg-primary hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:opacity-60",
                    isCollapsed ? "size-11 w-11 px-0" : "w-full px-3",
                  )}
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="size-4 shrink-0" aria-hidden="true" />
                  {!isCollapsed ? (
                    <span className="truncate">
                      {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                    </span>
                  ) : null}
                </button>
              </TooltipTrigger>
              {isCollapsed ? (
                <TooltipContent side="right">Cerrar sesión</TooltipContent>
              ) : null}
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <CurrentUserAccessProvider access={access}>
      <div className="min-h-dvh overflow-x-clip bg-background text-charcoal">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-border bg-surface text-warm-brown shadow-soft transition-colors hover:bg-primary-soft hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir navegación"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>
        <div className="text-center">
          <p className="font-serif text-xl font-semibold leading-none">
            Nutrición Con Enfoque
          </p>
          <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">
            {roleLabel}
          </p>
        </div>
        <div className="grid size-10 place-items-center rounded-full bg-accent text-xs font-extrabold">
          {initials}
        </div>
      </header>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden overflow-x-visible border-r border-border bg-surface/88 shadow-soft backdrop-blur-xl transition-[width] duration-300 ease-[var(--ease-premium)] lg:block",
          collapsed ? "w-20" : "w-72",
        )}
      >
        {renderSidebarContent(collapsed)}
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              aria-label="Cerrar navegación"
              className="fixed inset-0 z-50 bg-charcoal/24 backdrop-blur-sm lg:hidden"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              type="button"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[min(21rem,calc(100vw-2rem))] overflow-x-hidden border-r border-border bg-surface shadow-premium lg:hidden"
              initial={reduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 0.72, 0.18, 1] }}
            >
              {renderSidebarContent(false)}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <main
        className={cn(
          "min-h-dvh min-w-0 transition-[padding] duration-300 ease-[var(--ease-premium)] lg:pl-72",
          collapsed && "lg:pl-20",
        )}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 0.72, 0.18, 1] }}
        >
          {children}
        </motion.div>
      </main>

      <button
        type="button"
        className="fixed bottom-5 right-5 z-30 hidden size-11 place-items-center rounded-full border border-border bg-surface text-warm-brown shadow-pop transition-colors hover:bg-primary hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 lg:grid"
        onClick={() => setCollapsed((current) => !current)}
        aria-label={collapsed ? "Expandir navegación" : "Contraer navegación"}
      >
        {collapsed ? (
          <ChevronRight className="size-4" aria-hidden="true" />
        ) : (
          <ChevronLeft className="size-4" aria-hidden="true" />
        )}
      </button>
      </div>
    </CurrentUserAccessProvider>
  );
}
