import {
  ArrowRight,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { BasicAccountForm } from "@/components/app/basic-account-form";
import { AppHeader, AppPanel, AppScreen } from "@/components/app/AppScreen";
import { PersonalDetailsForm } from "@/components/app/personal-details-form";
import { Button } from "@/components/ui/button";
import { getPersonalDetails } from "@/lib/account/personal-details";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

export default async function SettingsPage() {
  const access = await requireRouteAccess("/app/configuracion");
  const personalDetails = await getPersonalDetails(access.userId);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Cuenta"
        title="Configuracion"
        description="Perfil, preferencias y datos asociados a tu cuenta."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AppPanel title="Perfil activo" description={access.roleLabel}>
          <div className="mb-5 flex items-center gap-4 rounded-[20px] border border-border bg-background p-4">
            <div className="grid size-12 place-items-center rounded-full bg-accent text-sm font-extrabold text-charcoal">
              {access.initials}
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-charcoal">{access.displayName}</h2>
              <p className="mt-1 truncate text-sm text-muted">{access.email}</p>
            </div>
          </div>
          <BasicAccountForm
            email={access.email}
            fullName={access.displayName}
          />
        </AppPanel>

        <AppPanel
          title="Informacion personal opcional"
          description="Completa solo los datos que quieras conservar en tu perfil."
        >
          <div className="mb-5 flex items-start gap-3 rounded-[20px] border border-primary/25 bg-primary-soft/60 p-4">
            <LockKeyhole
              className="mt-0.5 size-5 shrink-0 text-warm-brown"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-extrabold text-charcoal">
                Privacidad por defecto
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                Estos datos no son publicos. Solo vos y, para perfiles de
                clientes, profesionales autorizados pueden consultarlos.
              </p>
            </div>
          </div>
          <PersonalDetailsForm
            hasSavedDetails={personalDetails.hasSavedDetails}
            initialValues={personalDetails.values}
            maxBirthDate={new Date().toISOString().slice(0, 10)}
          />
        </AppPanel>

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
