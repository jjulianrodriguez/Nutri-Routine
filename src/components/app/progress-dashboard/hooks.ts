import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import type { ProgressPageData } from "@/lib/progress/data";

export function useProgressDashboardState({
 access,
 data,
}: {
 access: CurrentUserAccess;
 data: ProgressPageData;
}) {
 const selectedClient = data.selectedClient;
 const selectedClientId = selectedClient?.id ?? null;
 const shouldShowClientSelector = !access.isClient && data.clientOptions.length > 0;
 const clientSelectorEmptyState =
 !access.isClient && data.clientOptions.length === 0
 ? {
 description: "No hay clientes activos disponibles para tu cuenta.",
 title: "No hay clientes para mostrar",
 }
 : null;
 const selectedClientEmptyState = !selectedClient
 ? data.invalidClientSelection
 ? {
 description:
 "No encontramos ese cliente entre los clientes disponibles para tu cuenta.",
 title: "Cliente no encontrado",
 }
 : {
 description:
 "Selecciona un cliente para ver su progreso de nutricion, entrenamiento, habitos y medidas.",
 title: "Selecciona un cliente para ver su progreso",
 }
 : null;

 return {
 clientSelectorEmptyState,
 selectedClient,
 selectedClientEmptyState,
 selectedClientId,
 shouldShowClientSelector,
 };
}
