import { Clock, ShieldCheck, UserRound } from "lucide-react";

import { BasicAccountForm } from "@/components/app/basic-account-form";
import { AppHeader, AppPanel, AppScreen } from "@/components/app/AppScreen";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

export default async function PendingAccountPage() {
  const access = await requireRouteAccess("/app/pending");

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Cuenta pendiente"
        title="Tu cuenta fue creada correctamente."
        description="Un administrador debe activar tus servicios antes de que puedas acceder a la app."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AppPanel
          title="Estado de activacion"
          description="Tu rol sigue siendo cliente, pero todavía no hay profesionales de nutrición o entrenamiento asignados."
          tone="primary"
        >
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <div className="h-fit self-start rounded-[20px] border border-primary/30 bg-surface p-4">
              <Clock className="size-5 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-4 font-extrabold text-foreground">
                Servicios pendientes
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Cuando se active nutrición, entrenamiento o ambos, tu dashboard
                mostrará solo esas secciones.
              </p>
            </div>
            <div className="h-fit self-start rounded-[20px] border border-primary/30 bg-surface p-4">
              <ShieldCheck
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="mt-4 font-extrabold text-foreground">
                Acceso limitado
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Por ahora solo podes revisar datos basicos de cuenta y cerrar
                sesión.
              </p>
            </div>
          </div>
        </AppPanel>

        <AppPanel
          title="Datos basicos"
          description="Estos datos no activan servicios ni cambian tus permisos."
        >
          <div className="mb-5 flex items-center gap-4 rounded-[20px] border border-border bg-background p-4">
            <div className="grid size-12 place-items-center rounded-full bg-secondary text-sm font-extrabold text-secondary-foreground">
              {access.initials}
            </div>
            <div className="min-w-0">
              <UserRound className="mb-2 size-5 text-muted-foreground" />
              <h2 className="truncate font-extrabold text-foreground">
                {access.displayName}
              </h2>
              <p className="mt-1 truncate text-sm text-muted">{access.email}</p>
            </div>
          </div>
          <BasicAccountForm
            email={access.email}
            fullName={access.displayName}
          />
        </AppPanel>
      </div>
    </AppScreen>
  );
}
