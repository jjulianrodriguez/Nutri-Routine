import { CalendarManager } from "@/components/app/domains/calendar";
import {
 AppHeader,
 AppScreen,
 StatTile,
} from "@/components/app/layouts/AppScreen";
import { getCalendarPageData } from "@/lib/calendar/data";
import { requireRouteAccess } from "@/lib/auth/current-user-access";

export const dynamic = "force-dynamic";

type CalendarPageProps = {
 searchParams?: Promise<{
 area?: string;
 client?: string;
 month?: string;
 professional?: string;
 status?: string;
 }>;
};

export default async function CalendarPage({
 searchParams,
}: CalendarPageProps) {
 const [access, params] = await Promise.all([
 requireRouteAccess("/app/calendario"),
 searchParams,
 ]);
 const data = await getCalendarPageData(access, params ?? {});
 const pendingEvents = data.events.filter(
 (event) => event.status === "scheduled",
 ).length;
 const completedEvents = data.events.filter(
 (event) => event.status === "completed",
 ).length;
 const cancelledEvents = data.events.filter(
 (event) => event.status === "cancelled",
 ).length;

 return (
 <AppScreen>
 <AppHeader
 eyebrow={access.isClient ? "Mi acompañamiento" : "Operación"}
 title="Calendario"
 description={
 access.isClient
 ? "Consulta tus citas, recordatorios, seguimientos y revisiones relacionadas con tus servicios activos."
 : "Organiza citas, recordatorios y seguimientos mensuales para clientes según rol, área y permisos."
 }
 />

 <section
 className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4"
 aria-label="Resumen del calendario"
 >
 <StatTile
 label="Eventos del mes"
 value={String(data.events.length)}
 detail="Visibles segun tus permisos"
 />
 <StatTile
 label="Programados"
 value={String(pendingEvents)}
 detail="Citas y recordatorios activos"
 />
 <StatTile
 label="Completados"
 value={String(completedEvents)}
 detail="Seguimientos marcados como cerrados"
 />
 <StatTile
 label="Cancelados"
 value={String(cancelledEvents)}
 detail="Eventos anulados del mes"
 />
 </section>

 <CalendarManager data={data} />
 </AppScreen>
 );
}
