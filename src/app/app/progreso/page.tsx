import { TrendingUp } from "lucide-react";

import { AppHeader, AppPanel, AppScreen, EmptyState, StatTile } from "@/components/app/AppScreen";
import { getProgressData } from "@/lib/app/dashboard-data";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

function ProgressRecords({
  records,
}: {
  records: Awaited<ReturnType<typeof getProgressData>>["records"];
}) {
  if (records.length === 0) {
    return <EmptyState>No hay registros de progreso todavia.</EmptyState>;
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <article
          key={record.id}
          className="rounded-[20px] border border-border bg-background p-4"
        >
          <h2 className="font-extrabold text-charcoal">{record.title}</h2>
          {record.detail ? (
            <p className="mt-2 text-sm text-muted">{record.detail}</p>
          ) : null}
          {record.meta ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-warm-brown">
              {record.meta}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default async function ProgressPage() {
  const access = await requireRouteAccess("/app/progreso");
  const data = await getProgressData(access);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Mi progreso"
        title="Mi progreso"
        description="Seguimiento personal para clientes, separado de las herramientas administrativas."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Nutricion"
          value={access.hasNutritionService ? "Activa" : "No asignada"}
          detail="Disponible si hay un profesional en nutricion asignado"
        />
        <StatTile
          label="Entrenamiento"
          value={access.hasTrainingService ? "Activo" : "No asignado"}
          detail="Disponible si hay un profesional en entrenamiento asignado"
        />
        <StatTile
          label="Registros"
          value={String(data.count)}
          detail="Filtrados por tu cuenta"
        />
      </section>

      <AppPanel
        title="Registro de avances"
        description="Metricas reales guardadas en progress_entries."
        tone="accent"
      >
        <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
          <TrendingUp className="size-5 text-warm-brown" />
          <h2 className="mt-4 font-extrabold text-charcoal">
            Tendencias personales
          </h2>
          <div className="mt-4">
            <ProgressRecords records={data.records} />
          </div>
        </div>
      </AppPanel>
    </AppScreen>
  );
}
