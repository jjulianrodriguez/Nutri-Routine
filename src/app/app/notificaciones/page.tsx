import {
  AppHeader,
  AppPanel,
  AppScreen,
  StatTile,
} from "@/components/app/AppScreen";
import { NotificationCenter } from "@/components/app/notification-center";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getNotifications } from "@/lib/notifications/data";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const access = await requireRouteAccess("/app/notificaciones");
  const result = await getNotifications(access.userId);
  const unreadCount = result.items.filter(
    (notification) => notification.read_at === null,
  ).length;
  const pageDescription = access.isClient
    ? access.canViewTraining && !access.canViewNutrition
      ? "Consulta avisos sobre tu entrenamiento, calendario y recursos."
      : access.canViewNutrition && !access.canViewTraining
        ? "Consulta avisos sobre tu nutricion, calendario y recursos."
        : "Consulta avisos sobre tus planes, calendario y recursos."
    : "Consulta cambios importantes en tus clientes, planes, asignaciones, citas y recursos.";

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Actividad"
        title="Notificaciones"
        description={pageDescription}
      />

      {result.error ? (
        <AppPanel
          title="No pudimos cargar tus notificaciones"
          description="Ocurrio un problema al consultar tu actividad. Actualiza la pagina para intentarlo de nuevo."
          tone="accent"
        />
      ) : (
        <>
          <section
            className="grid gap-4 sm:grid-cols-3"
            aria-label="Resumen de notificaciones"
          >
            <StatTile
              label="Total"
              value={String(result.items.length)}
              detail="Actividad reciente disponible"
            />
            <StatTile
              label="Sin leer"
              value={String(unreadCount)}
              detail="Eventos que requieren tu atencion"
            />
            <StatTile
              label="Leidas"
              value={String(result.items.length - unreadCount)}
              detail="Eventos que ya revisaste"
            />
          </section>

          <AppPanel
            title="Actividad reciente"
            description={
              access.isClient
                ? "Selecciona una notificacion para abrir el detalle relacionado."
                : "Selecciona una notificacion para abrir la seccion exacta relacionada."
            }
          >
            <NotificationCenter
              hasNutrition={access.canViewNutrition}
              hasTraining={access.canViewTraining}
              notifications={result.items}
              viewer={access.isClient ? "client" : "professional"}
            />
          </AppPanel>
        </>
      )}
    </AppScreen>
  );
}
