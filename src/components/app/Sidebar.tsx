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
import { Suspense, useEffect, useState } from "react";

import { ChatWidget } from "@/components/app/chat-widget";
import { CurrentUserAccessProvider } from "@/components/app/current-user-access-provider";
import { SidebarNav } from "@/components/app/SidebarNav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
 unreadNotifications: number;
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
 "flex min-w-0 items-center gap-3 rounded-card border-[var(--sidebar-border)] bg-[var(--sidebar-accent)] p-3 text-[var(--sidebar-foreground)] shadow-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--sidebar-primary)]/25",
 !collapsed && "pr-14 lg:pr-3",
 collapsed && "mx-auto size-12 justify-center rounded-full p-0",
 )}
 tabIndex={collapsed ? 0 : undefined}
 aria-label={
 collapsed ? `Perfil activo: ${displayName}, ${roleLabel}` : undefined
 }
 >
 <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--sidebar-primary)] text-sm font-extrabold text-[var(--sidebar-primary-foreground)]">
 {initials}
 </div>
 {!collapsed ? (
 <div className="min-w-0">
 <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--sidebar-foreground)]">
 Perfil activo
 </p>
 <p className="mt-1 truncate text-sm font-extrabold text-[var(--sidebar-foreground)]">
 {displayName}
 </p>
 <p className="truncate text-xs font-semibold text-[var(--sidebar-foreground)]">{email || roleLabel}</p>
 {email ? (
 <p className="truncate text-xs font-bold text-[var(--sidebar-foreground)]">
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
 unreadNotifications,
}: SidebarProps) {
 const router = useRouter();
 const reduceMotion = useReducedMotion();
 const [collapsed, setCollapsed] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [isLoggingOut, setIsLoggingOut] = useState(false);
 const [isPageAnimated, setIsPageAnimated] = useState(false);
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
 "relative border-b border-white/12 py-4",
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
 className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border-white/12 bg-white/8 text-white/72 shadow-none transition-colors hover:bg-white/14 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30 lg:hidden"
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
 unreadNotifications={unreadNotifications}
 />
 </div>

 <div
 className={cn(
 "mt-auto border-t border-white/12 py-4",
 isCollapsed ? "flex flex-col items-center gap-3 px-3" : "space-y-3 px-4",
 )}
 >
 <Tooltip>
 <TooltipTrigger asChild>
 <ThemeToggle
 showLabel={!isCollapsed}
 className={cn(!isCollapsed && "w-full")}
 />
 </TooltipTrigger>
 {isCollapsed ? (
 <TooltipContent side="right">Cambiar tema</TooltipContent>
 ) : null}
 </Tooltip>

 <Tooltip>
 <TooltipTrigger asChild>
 <button
 type="button"
 onClick={handleLogout}
 disabled={isLoggingOut}
 className={cn(
 "flex h-11 min-w-0 items-center justify-center gap-3 rounded-control border-white/12 bg-white/8 text-sm font-extrabold text-white/72 shadow-none transition-[background-color,border-color,color,box-shadow,transform] hover:border-white/24 hover:bg-white/14 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30 active:translate-y-px disabled:opacity-60",
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
 <div className="min-h-dvh overflow-x-clip bg-background text-foreground">
 <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/12 bg-sidebar px-4 text-white lg:hidden">
 <button
 type="button"
 className="grid size-10 place-items-center rounded-full border-white/12 bg-white/8 text-white/72 shadow-none transition-colors hover:bg-white/14 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30"
 onClick={() => setMobileOpen(true)}
 aria-label="Abrir navegación"
 >
 <Menu className="size-4" aria-hidden="true" />
 </button>
 <div className="text-center">
 <p className="font-heading text-xl font-bold leading-none">
 Nutrición Con Enfoque
 </p>
 <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/60">
 {roleLabel}
 </p>
 </div>
 <div className="grid size-10 place-items-center rounded-full bg-white text-xs font-extrabold text-primary">
 {initials}
 </div>
 </header>

 <aside
 className={cn(
 "fixed inset-y-0 left-0 z-40 hidden h-screen h-dvh overflow-x-visible border-r border-white/10 bg-sidebar text-white transition-[width] duration-300 ease-[var(--ease-premium)] lg:block",
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
              className="fixed inset-0 z-50 bg-foreground/55 lg:hidden"
 initial={reduceMotion ? false : { opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setMobileOpen(false)}
 type="button"
 />
 <motion.aside
 className="fixed inset-y-0 left-0 z-50 h-screen h-dvh w-[min(21rem,calc(100vw-2rem))] overflow-x-hidden border-r border-white/10 bg-sidebar text-white lg:hidden"
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
 id="main-content"
 tabIndex={-1}
 className={cn(
 "min-h-dvh min-w-0 scroll-mt-20 transition-[padding] duration-300 ease-[var(--ease-premium)] focus-visible:outline-none lg:pl-72",
 collapsed && "lg:pl-20",
 )}
 >
 <motion.div
 initial={reduceMotion ? false : { opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.45, ease: [0.22, 0.72, 0.18, 1] }}
 onAnimationComplete={() => setIsPageAnimated(true)}
 style={isPageAnimated ? { transform: "none" } : undefined}
 >
 {children}
 </motion.div>
 </main>

 <Suspense fallback={null}>
 <ChatWidget />
 </Suspense>

 <button
 type="button"
 className={cn(
 "fixed bottom-5 z-50 hidden size-11 place-items-center rounded-full border-white/18 bg-sidebar text-white/76 transition-[left,background-color,color,box-shadow,transform] hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30 active:translate-y-px lg:grid",
 collapsed
 ? "left-[calc(5rem-1.375rem)]"
 : "left-[calc(18rem-1.375rem)]",
 )}
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
