import {
  ArrowRight,
  Bell,
  Eye,
  Languages,
  LockKeyhole,
  MonitorSmartphone,
  Settings,
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
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

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
  status = "Disponible",
}: {
  children: ReactNode;
  icon: ReactNode;
  label: string;
  status?: "Disponible" | "Pendiente" | "Solo lectura";
}) {
  const tone = status === "Disponible" ? "success" : status === "Pendiente" ? "warning" : "muted";

  return (
    <div className="rounded-[18px] border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-warm-brown">
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="font-extrabold text-charcoal">{label}</h3>
            <div className="mt-1 text-sm font-semibold leading-6 text-muted">
              {children}
            </div>
          </div>
        </div>
        <RelationshipBadge tone={tone}>{status}</RelationshipBadge>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const access = await requireRouteAccess("/app/configuracion");

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Cuenta"
        title="Configuracion"
        description="Cuenta, seguridad, privacidad y preferencias disponibles para tu acceso."
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
          <AppPanel title="Cuenta" description="Identidad de acceso y rol actual.">
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
            <div className="space-y-3">
              <SettingRow
                icon={<UserCog className="size-4" aria-hidden="true" />}
                label="Cambiar correo electronico"
                status="Pendiente"
              >
                El correo se muestra en modo lectura. El cambio de email queda
                pendiente hasta conectar un flujo seguro de confirmacion.
              </SettingRow>
              <SettingRow
                icon={<LockKeyhole className="size-4" aria-hidden="true" />}
                label="Cambiar contrasena"
              >
                Disponible en la subseccion Seguridad para evitar duplicar el
                formulario.
              </SettingRow>
              <div className="pt-2">
                <LogoutButton />
              </div>
            </div>
          </AppPanel>
        </section>

        <section id="apariencia" className="scroll-mt-24">
          <AppPanel title="Apariencia" description="Tema visual y preferencias de lectura.">
            <div className="space-y-3">
              <SettingRow
                icon={<MonitorSmartphone className="size-4" aria-hidden="true" />}
                label="Modo claro/oscuro"
              >
                <ThemeToggle showLabel />
              </SettingRow>
              <SettingRow
                icon={<MonitorSmartphone className="size-4" aria-hidden="true" />}
                label="Tema del sistema"
                status="Pendiente"
              >
                La app guarda claro/oscuro manualmente. Sincronizar con el
                sistema queda pendiente.
              </SettingRow>
              <SettingRow
                icon={<Eye className="size-4" aria-hidden="true" />}
                label="Tamano de texto y animaciones"
                status="Pendiente"
              >
                No hay preferencias persistentes todavia. Se respeta
                `prefers-reduced-motion` desde CSS cuando aplica.
              </SettingRow>
            </div>
          </AppPanel>
        </section>

        <section id="privacidad" className="scroll-mt-24">
          <AppPanel
            title="Privacidad"
            description="Visibilidad de informacion personal y datos sensibles."
          >
            <div className="space-y-3">
              <SettingRow
                icon={<ShieldCheck className="size-4" aria-hidden="true" />}
                label="Quien puede ver mi informacion"
                status="Solo lectura"
              >
                Tu informacion personal no es publica. El acceso depende de las
                politicas de Supabase y las relaciones asignadas.
              </SettingRow>
              <SettingRow
                icon={<Users className="size-4" aria-hidden="true" />}
                label="Datos fisicos y salud"
                status="Solo lectura"
              >
                Los datos de salud solo deben ser visibles para vos,
                profesionales asignados y admin autorizado.
              </SettingRow>
              <SettingRow
                icon={<Eye className="size-4" aria-hidden="true" />}
                label="Ocultar datos sensibles"
                status="Pendiente"
              >
                No existe aun una preferencia granular para ocultar campos
                especificos dentro del perfil.
              </SettingRow>
            </div>
          </AppPanel>
        </section>

        <section id="notificaciones" className="scroll-mt-24">
          <AppPanel
            title="Notificaciones"
            description="Avisos de mensajes, citas, planes y recordatorios."
          >
            <div className="space-y-3">
              <SettingRow
                icon={<Bell className="size-4" aria-hidden="true" />}
                label="Centro de notificaciones"
              >
                <Button asChild variant="outline">
                  <Link href="/app/notificaciones">
                    Ver notificaciones
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </SettingRow>
              <SettingRow
                icon={<Bell className="size-4" aria-hidden="true" />}
                label="Preferencias por tipo"
                status="Pendiente"
              >
                Mensajes, citas, cambios en planes, recordatorios y email
                quedan preparados visualmente, sin interruptores falsos.
              </SettingRow>
            </div>
          </AppPanel>
        </section>

        <section id="seguridad" className="scroll-mt-24">
          <AppPanel
            title="Seguridad"
            description="Actualiza la contrasena de acceso de tu cuenta."
          >
            <PasswordChangeForm />
            <div className="mt-5 grid gap-3">
              <SettingRow
                icon={<ShieldCheck className="size-4" aria-hidden="true" />}
                label="Sesiones activas"
                status="Pendiente"
              >
                Supabase Auth no esta conectado aqui a una vista de sesiones
                activas.
              </SettingRow>
              <SettingRow
                icon={<LockKeyhole className="size-4" aria-hidden="true" />}
                label="Cerrar sesion en todos los dispositivos"
                status="Pendiente"
              >
                Pendiente de una accion segura con confirmacion explicita.
              </SettingRow>
            </div>
          </AppPanel>
        </section>

        <section id="preferencias" className="scroll-mt-24">
          <AppPanel title="Preferencias" description="Idioma, zona horaria y formato.">
            <div className="space-y-3">
              <SettingRow
                icon={<Languages className="size-4" aria-hidden="true" />}
                label="Idioma"
                status="Pendiente"
              >
                La interfaz esta en espanol. Selector de idioma pendiente.
              </SettingRow>
              <SettingRow
                icon={<Settings className="size-4" aria-hidden="true" />}
                label="Zona horaria"
                status="Solo lectura"
              >
                La app usa America/Costa_Rica para agenda y horarios visibles.
              </SettingRow>
              <SettingRow
                icon={<Settings className="size-4" aria-hidden="true" />}
                label="Formato 12h/24h"
                status="Pendiente"
              >
                Aun no hay preferencia persistente por usuario.
              </SettingRow>
            </div>
          </AppPanel>
        </section>

        {access.canAccessOnlyBasicSettings ? (
          <AppPanel
            title="Cuenta pendiente"
            description="Tu acceso se mantiene limitado hasta que un administrador asigne nutricion, entrenamiento o ambos."
            tone="primary"
          >
            <div className="rounded-[20px] border border-primary/30 bg-surface p-4">
              <Settings className="size-5 text-warm-brown" />
              <h3 className="mt-4 font-extrabold text-charcoal">
                Solo configuracion basica
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                No podes activar servicios ni modificar asignaciones desde esta
                cuenta.
              </p>
            </div>
          </AppPanel>
        ) : null}

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
