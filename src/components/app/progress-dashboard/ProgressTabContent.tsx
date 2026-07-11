import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import type { ProgressPageData, ProgressTab } from "@/lib/progress/data";

import { ProgressMeasurements } from "./ProgressMeasurements";
import { ProgressNutrition } from "./ProgressNutrition";
import { ProgressSummary } from "./ProgressSummary";
import { ProgressTraining } from "./ProgressTraining";

export function ProgressTabContent({
 access,
 activeTab,
 data,
}: {
 access: CurrentUserAccess;
 activeTab: ProgressTab;
 data: ProgressPageData;
}) {
 const selectedClient = data.selectedClient;

 if (!selectedClient) {
 return null;
 }

 if (activeTab === "resumen") {
 return <ProgressSummary access={access} data={data} />;
 }

 if (activeTab === "nutricion") {
 return (
 <ProgressNutrition
 access={access}
 block={data.nutrition}
 permissions={data.permissions}
 selectedClient={selectedClient}
 />
 );
 }

 if (activeTab === "entrenamiento") {
 return (
 <ProgressTraining
 access={access}
 block={data.training}
 permissions={data.permissions}
 selectedClient={selectedClient}
 />
 );
 }

 if (activeTab === "medidas") {
 return (
 <ProgressMeasurements
 access={access}
 block={data.measurements}
 permissions={data.permissions}
 selectedClient={selectedClient}
 />
 );
 }

 return null;
}
