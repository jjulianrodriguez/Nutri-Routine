import { ArrowRight, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { BasicAccountForm } from "@/components/app/basic-account-form";
import { AppHeader, AppPanel, AppScreen } from "@/components/app/AppScreen";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

export default async function SettingsPage() {
  const access = await requireRouteAccess("/app/configuracion");

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Cuenta"
        title="Configuracion"
        description="Perfil, preferencias y datos de cuenta para el usuario autenticado."
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

        {access.isAdmin ? (
          <AppPanel
            title="Administracion"
            description="Herramientas internas visibles solo para roles administrativos."
            tone="primary"
          >
            <div className="grid gap-3">
              <Button asChild size="lg">
                <Link href="/app/clientes">
                  <Users className="size-4" aria-hidden="true" />
                  Clientes y activacion
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/app/configuracion/profesionales">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Cuentas profesionales
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </AppPanel>
        ) : null}
      </div>
    </AppScreen>
  );
}
