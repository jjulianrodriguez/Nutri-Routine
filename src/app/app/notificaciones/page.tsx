import {
 AppHeader,
 AppPanel,
 AppScreen,
} from "@/components/app/layouts/AppScreen";
import { NotificationCenter } from "@/components/app/domains/messaging/notification-center";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getNotifications } from "@/lib/notifications/data";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
 const access = await requireRouteAccess("/app/notificaciones");
 const result = await getNotifications(access.userId);
 const pageDescription = access.isClient
 ? access.canViewTraining && !access.canViewNutrition
 ? "Consulta avisos sobre tu entrenamiento, calendario y recursos."
 : access.canViewNutrition && !access.canViewTraining
 ? "Consulta avisos sobre tu nutrición, calendario y recursos."
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
 description="Ocurrió un problema al consultar tu actividad. Actualiza la página para intentarlo de nuevo."
 tone="accent"
 />
 ) : (
 <section
 className="rounded-[28px] bg-surface p-5 sm:p-6"
 aria-label="Notificaciones"
 >
 <NotificationCenter
 assignedNutritionistName={access.assignedNutritionistName}
 assignedTrainerName={access.assignedTrainerName}
 hasNutrition={access.canViewNutrition}
 hasTraining={access.canViewTraining}
 notifications={result.items}
 viewer={access.isClient ? "client" : "professional"}
 />
 </section>
 )}
 </AppScreen>
 );
}
