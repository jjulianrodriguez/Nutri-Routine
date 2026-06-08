import { UserRound } from "lucide-react";

import { AppHeader, AppPanel, AppScreen, StatTile } from "@/components/app/AppScreen";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

export default async function ProfilePage() {
  const access = await requireRouteAccess("/app/perfil");

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Mi perfil"
        title="Mi perfil"
        description="Resumen personal para clientes. Los perfiles administrativos usan Configuracion."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Nutricion"
          value={access.hasNutritionService ? "Activa" : "No asignada"}
          detail="assigned_nutritionist_id"
        />
        <StatTile
          label="Entrenamiento"
          value={access.hasTrainingService ? "Activo" : "No asignado"}
          detail="assigned_trainer_id"
        />
        <StatTile label="Rol" value="Cliente" detail="profiles.role" />
      </section>

      <AppPanel title="Datos de cuenta" description={access.roleLabel}>
        <div className="flex items-center gap-4 rounded-[20px] border border-border bg-background p-4">
          <div className="grid size-12 place-items-center rounded-full bg-accent text-sm font-extrabold text-charcoal">
            {access.initials}
          </div>
          <div>
            <UserRound className="mb-3 size-5 text-warm-brown" />
            <h2 className="font-extrabold text-charcoal">{access.displayName}</h2>
            <p className="mt-1 text-sm text-muted">{access.email}</p>
          </div>
        </div>
      </AppPanel>
    </AppScreen>
  );
}
