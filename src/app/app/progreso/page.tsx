import { TrendingUp } from "lucide-react";

import { AppHeader, AppPanel, AppScreen, EmptyState, StatTile } from "@/components/app/AppScreen";
import { AssignedProfessionalCards } from "@/components/app/relationship-badges";
import { getProgressData } from "@/lib/app/dashboard-data";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

function ProgressRecords({
  records,
}: {
  records: Awaited<ReturnType<typeof getProgressData>>["records"];
}) {
  if (records.length === 0) {
    return <EmptyState>No hay registros de progreso todavía.</EmptyState>;
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
        eyebrow={access.role === "admin" ? "Administracion" : "Mi progreso"}
        title={access.role === "admin" ? "Progreso de clientes" : "Mi progreso"}
        description={
          access.role === "admin"
            ? "Vista global de registros de progreso para supervision administrativa."
            : "Seguimiento personal para clientes, separado de las herramientas administrativas."
        }
      />

      <section
        className={
          access.role === "admin"
            ? "grid gap-4"
            : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {access.role !== "admin" ? (
          <>
            <StatTile
              label="Nutrición"
              value={access.hasNutritionService ? "Activa" : "No asignada"}
              detail={
                access.assignedNutritionistName
                  ? `Con ${access.assignedNutritionistName}`
                  : "Sin profesional asignado"
              }
            />
            <StatTile
              label="Entrenamiento"
              value={access.hasTrainingService ? "Activo" : "No asignado"}
              detail={
                access.assignedTrainerName
                  ? `Con ${access.assignedTrainerName}`
                  : "Sin profesional asignado"
              }
            />
          </>
        ) : null}
        <StatTile
          label="Registros"
          value={String(data.count)}
          detail={
            access.role === "admin"
              ? "Visibles en toda la aplicacion"
              : "Filtrados por tu cuenta"
          }
        />
      </section>

      {access.role !== "admin" ? (
        <AssignedProfessionalCards
          assignedNutritionistId={access.assignedNutritionistId}
          assignedNutritionistName={access.assignedNutritionistName}
          assignedTrainerId={access.assignedTrainerId}
          assignedTrainerName={access.assignedTrainerName}
        />
      ) : null}

      <AppPanel
        title="Registro de avances"
        description="Consulta tus metricas y revisa como evolucionan tus avances."
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
