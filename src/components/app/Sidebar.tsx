"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { SidebarNav, type AppRole } from "@/components/app/SidebarNav";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nce-app-sidebar-collapsed";

type SidebarProps = {
  children: ReactNode;
  displayName: string;
  email?: string;
  initials: string;
  role: AppRole;
  roleLabel: string;
};

function BrandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-[18px] border border-charcoal/10 bg-primary text-lg font-extrabold text-charcoal shadow-soft">
        NC
      </div>
      <div
        className={cn(
          "min-w-0 transition-[opacity,transform,width] duration-200",
          collapsed && "w-0 -translate-x-1 opacity-0",
        )}
      >
        <p className="truncate font-serif text-xl font-semibold leading-none text-charcoal">
          Nutrición Con Enfoque
        </p>
        <p className="mt-1 truncate text-xs font-bold uppercase tracking-[0.14em] text-muted">
          Área privada
        </p>
      </div>
    </div>
  );
}

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
  return (
    <div
      className={cn(
        "rounded-[22px] border border-border bg-surface p-3 shadow-soft",
        collapsed && "flex justify-center p-2",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-extrabold text-charcoal">
          {initials}
        </div>
        <div
          className={cn(
            "min-w-0 transition-[opacity,transform,width] duration-200",
            collapsed && "w-0 -translate-x-1 opacity-0",
          )}
        >
          <p className="truncate text-sm font-extrabold text-charcoal">
            {displayName}
          </p>
          <p className="truncate text-xs text-muted">{email || roleLabel}</p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  children,
  displayName,
  email,
  initials,
  role,
  roleLabel,
}: SidebarProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      <div className="flex h-full flex-col">
      <div className="space-y-4 border-b border-border px-4 pb-5 pt-4">
        <div className="flex items-center justify-between gap-3">
          <BrandMark collapsed={isCollapsed} />
          <button
            type="button"
            className="hidden size-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-warm-brown shadow-soft hover:bg-primary-soft hover:text-charcoal lg:grid"
            onClick={() => setCollapsed((current) => !current)}
            aria-label={isCollapsed ? "Expandir navegación" : "Contraer navegación"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-surface text-warm-brown shadow-soft hover:bg-primary-soft hover:text-charcoal lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar navegación"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className={cn(
            "rounded-[20px] border border-primary/25 bg-primary-soft px-3 py-3 transition-[opacity,transform,width] duration-200",
            isCollapsed && "grid size-11 place-items-center rounded-full p-0",
          )}
        >
          {isCollapsed ? (
            <span className="text-xs font-extrabold text-charcoal">
              {role === "client" ? "CL" : "PR"}
            </span>
          ) : (
            <>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
                Perfil activo
              </p>
              <p className="mt-1 text-sm font-extrabold text-charcoal">
                {roleLabel}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 no-scrollbar">
        <SidebarNav
          collapsed={isCollapsed}
          role={role}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div className="space-y-3 border-t border-border px-4 py-4">
        <ProfileBlock
          collapsed={isCollapsed}
          displayName={displayName}
          email={email}
          initials={initials}
          roleLabel={roleLabel}
        />
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "group/logout flex h-11 w-full items-center justify-center gap-3 rounded-control border border-border bg-surface text-sm font-extrabold text-warm-brown shadow-soft hover:border-primary/30 hover:bg-primary hover:text-charcoal disabled:opacity-60",
            isCollapsed && "px-0",
          )}
          aria-label="Cerrar sesión"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span
            className={cn(
              "truncate transition-[opacity,transform,width] duration-200",
              isCollapsed && "w-0 -translate-x-1 opacity-0",
            )}
          >
            {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
          </span>
        </button>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-charcoal">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-border bg-surface text-warm-brown shadow-soft hover:bg-primary-soft hover:text-charcoal"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir navegación"
        >
          <Menu className="size-4" />
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
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-surface/88 shadow-soft backdrop-blur-xl transition-[width] duration-300 ease-[var(--ease-premium)] lg:block",
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
              className="fixed inset-y-0 left-0 z-50 w-[min(21rem,calc(100vw-2rem))] border-r border-border bg-surface shadow-premium lg:hidden"
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
          "min-h-dvh transition-[padding] duration-300 ease-[var(--ease-premium)] lg:pl-72",
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
        className="fixed bottom-5 right-5 z-30 hidden size-11 place-items-center rounded-full border border-border bg-surface text-warm-brown shadow-pop hover:bg-primary hover:text-charcoal lg:grid"
        onClick={() => setCollapsed((current) => !current)}
        aria-label={collapsed ? "Expandir navegación" : "Contraer navegación"}
      >
        {collapsed ? (
          <ChevronRight className="size-4" />
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </button>
    </div>
  );
}
