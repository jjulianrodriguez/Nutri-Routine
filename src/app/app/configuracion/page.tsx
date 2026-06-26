import {
  ArrowRight,
  Mail,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppHeader, AppPanel, AppScreen } from "@/components/app/AppScreen";
import { LogoutButton } from "@/components/app/logout-button";
import { PasswordChangeForm } from "@/components/app/password-change-form";
import { RelationshipBadge } from "@/components/app/relationship-badges";
import { UserSettingsForm } from "@/components/app/user-settings-form";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getUserSettings } from "@/lib/user-settings/data";

function SectionNav({
  items,
}: {
  items: Array<{
    href: string;
    label: string;
  }>;
}) {
  return (
    <nav
      aria-label="Subsecciones de configuracion"
      className="flex gap-2 overflow-x-auto rounded-[22px] border border-border bg-surface/72 p-2 shadow-soft backdrop-blur-lg"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 rounded-[16px] px-3 py-2 text-sm font-extrabold text-warm-brown transition-colors hover:bg-primary-soft hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function SettingRow({
  children,
  icon,
  label,
}: {
  children: ReactNode;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-background p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-warm-brown">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-extrabold text-charcoal">{label}</h3>
          <div className="mt-1 min-w-0 break-words text-sm font-semibold leading-6 text-muted">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const access = await requireRouteAccess("/app/configuracion");
  const settings = await getUserSettings(access.userId);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Cuenta"
        title="Configuracion"
        description="Gestiona tu cuenta, privacidad, notificaciones y seguridad."
      />

      <SectionNav
        items={[
          { href: "#cuenta", label: "Cuenta" },
          { href: "#apariencia", label: "Apariencia" },
          { href: "#privacidad", label: "Privacidad" },
          { href: "#notificaciones", label: "Notificaciones" },
          { href: "#seguridad", label: "Seguridad" },
          { href: "#preferencias", label: "Preferencias" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section id="cuenta" className="scroll-mt-24">
          <AppPanel title="Cuenta" description="Datos principales de tu acceso.">
            <div className="mb-5 flex items-center gap-4 rounded-[20px] border border-border bg-background p-4">
              <div className="grid size-12 place-items-center rounded-full bg-accent text-sm font-extrabold text-charcoal">
                {access.initials}
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-charcoal">{access.displayName}</h2>
                <p className="mt-1 truncate text-sm text-muted">{access.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <RelationshipBadge tone="primary">{access.roleLabel}</RelationshipBadge>
                  <RelationshipBadge tone="neutral">
                    Rol: {access.role === "client" ? "cliente" : access.role === "professional" ? "profesional" : "admin"}
                  </RelationshipBadge>
                </div>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <SettingRow
                icon={<Mail className="size-4" aria-hidden="true" />}
                label="Correo electronico"
              >
                {access.email || "Correo no disponible"}
              </SettingRow>
              <SettingRow
                icon={<UserCog className="size-4" aria-hidden="true" />}
                label="Rol actual"
              >
                {access.role === "client"
                  ? "Cliente"
                  : access.role === "professional"
                    ? "Profesional"
                    : "Administrador"}
              </SettingRow>
            </div>
            <div className="mt-5">
              <LogoutButton />
            </div>
          </AppPanel>
        </section>

        <UserSettingsForm initialValues={settings} />

        <section id="seguridad" className="scroll-mt-24">
          <AppPanel
            title="Seguridad"
            description="Actualiza la contrasena de tu cuenta."
          >
            <PasswordChangeForm />
          </AppPanel>
        </section>

        {access.canManageClientPlans ||
        access.canManageProfessionalAccounts ? (
          <AppPanel
            title="Administracion"
            description="Herramientas de gestion disponibles para tu cuenta."
            tone="primary"
          >
            <div className="grid gap-3">
              {access.canManageClientPlans ? (
                <Button asChild size="lg">
                  <Link href="/app/clientes">
                    <Users className="size-4" aria-hidden="true" />
                    Usuarios y planes
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              {access.canManageProfessionalAccounts ? (
                <Button asChild size="lg" variant="outline">
                  <Link href="/app/configuracion/profesionales">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Cuentas profesionales
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </AppPanel>
        ) : null}
      </div>
    </AppScreen>
  );
}
