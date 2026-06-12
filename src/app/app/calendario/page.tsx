import { CalendarDays } from "lucide-react";

import { AppHeader, AppPanel, AppScreen, EmptyState } from "@/components/app/AppScreen";
import { getCalendarData } from "@/lib/app/dashboard-data";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

function AppointmentRecords({
  records,
}: {
  records: Awaited<ReturnType<typeof getCalendarData>>["records"];
}) {
  if (records.length === 0) {
    return <EmptyState>No hay citas programadas todavia.</EmptyState>;
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

export default async function CalendarPage() {
  const access = await requireRouteAccess("/app/calendario");
  const data = await getCalendarData(access);

  return (
    <AppScreen>
      <AppHeader
        eyebrow={access.isClient ? "Mi acompanamiento" : "Operacion"}
        title="Calendario"
        description={
          access.isClient
            ? "Citas, recordatorios y proximos pasos relacionados con tus servicios activos."
            : "Agenda compartida para consultas y seguimientos de clientes."
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AppPanel
          title={access.isClient ? "Proximas citas" : "Agenda administrativa"}
          description={`${data.count} registros visibles en appointments.`}
        >
          <AppointmentRecords records={data.records} />
        </AppPanel>

        <AppPanel title="Recordatorios" tone="primary">
          <div className="rounded-[20px] border border-primary/30 bg-surface p-4">
            <CalendarDays className="size-5 text-warm-brown" />
            <h2 className="mt-4 font-extrabold text-charcoal">
              {access.isClient ? "Seguimiento personal" : "Seguimiento de clientes"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              La vista se adapta al rol sin exponer secciones administrativas a
              clientes.
            </p>
          </div>
        </AppPanel>
      </div>
    </AppScreen>
  );
}
