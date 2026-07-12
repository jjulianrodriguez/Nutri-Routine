import {
 ArrowRight,
 BadgeInfo,
 Mail,
 ShieldCheck,
 UserCog,
 Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { AppHeader, AppPanel, AppScreen } from "@/components/app/layouts/AppScreen";
import { LogoutButton } from "@/components/app/shared/logout-button";
import { PasswordChangeForm } from "@/components/app/domains/settings/password-change-form";
import { RelationshipBadge } from "@/components/app/shared/relationship-badges";
import { SectionTabs } from "@/components/app/shared/section-tabs";
import { UserSettingsForm } from "@/components/app/domains/settings/user-settings-form";
import { Button } from "@/components/ui/actions/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getUserSettings } from "@/lib/user-settings/data";

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
 <div className="h-fit self-start rounded-[18px] bg-background p-4">
 <div className="flex min-w-0 items-start gap-3">
 <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-muted-foreground">
 {icon}
 </span>
 <div className="min-w-0">
 <h3 className="font-extrabold text-foreground">{label}</h3>
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
 const profileEditHref = access.isProfessional
 ? "/app/perfil#informacion-profesional"
 : access.isClient
 ? "/app/perfil#informacion-personal"
 : "/app/perfil";

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Cuenta"
 title="Configuracion"
 description="Ajustes tecnicos de la app: acceso, seguridad, apariencia, notificaciones, privacidad y preferencias."
 />

 <SectionTabs
 ariaLabel="Subsecciones de configuracion"
 className="flex-nowrap overflow-x-auto backdrop-blur-lg"
 items={[
 { href: "#cuenta", id: "account", label: "Cuenta" },
 { href: "#apariencia", id: "appearance", label: "Apariencia" },
 { href: "#privacidad", id: "privacy", label: "Privacidad" },
 { href: "#notificaciones", id: "notifications", label: "Notificaciones" },
 { href: "#seguridad", id: "security", label: "Seguridad" },
 { href: "#preferencias", id: "preferences", label: "Preferencias" },
 ]}
 size="sm"
 />

 <div className="grid items-start gap-6 xl:grid-cols-2">
 <section id="cuenta" className="scroll-mt-24">
 <AppPanel
 title="Cuenta tecnica"
 description="Resumen de acceso. Los datos personales editables viven en Mi perfil para evitar duplicar formularios."
 >
 <div className="mb-5 flex items-center gap-4 rounded-[20px] bg-background p-4">
 <div className="grid size-12 place-items-center rounded-full bg-secondary text-sm font-extrabold text-secondary-foreground">
 {access.initials}
 </div>
 <div className="min-w-0">
 <h2 className="font-extrabold text-foreground">{access.displayName}</h2>
 <p className="mt-1 truncate text-sm text-muted">{access.email}</p>
 <div className="mt-2 flex flex-wrap gap-2">
 <RelationshipBadge tone="primary">{access.roleLabel}</RelationshipBadge>
 <RelationshipBadge tone="neutral">
 Rol: {access.role === "client" ? "cliente" : access.role === "professional" ? "profesional" : "admin"}
 </RelationshipBadge>
 </div>
 </div>
 </div>
 <div className="grid items-start gap-3 lg:grid-cols-2">
 <SettingRow
 icon={<BadgeInfo className="size-4" aria-hidden="true" />}
 label="Nombre visible"
 >
 {access.displayName}. Se edita desde Mi perfil, no desde
 Configuracion.
 </SettingRow>
 <SettingRow
 icon={<Mail className="size-4" aria-hidden="true" />}
 label="Correo electronico"
 >
 {access.email || "Correo no disponible"}. Es tu identificador de
 acceso y aqui se muestra solo como referencia.
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
 <div className="mt-5 flex flex-col gap-3 sm:flex-row">
 <Button asChild variant="outline">
 <Link href={profileEditHref}>
 Editar datos de perfil
 <ArrowRight className="size-4" aria-hidden="true" />
 </Link>
 </Button>
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
 <div className="grid items-start gap-3">
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
