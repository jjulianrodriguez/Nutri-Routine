import { CalendarClock, HeartPulse, Scale, UserRound } from "lucide-react";
import Link from "next/link";

import { AppPanel, EmptyState } from "@/components/app/AppScreen";
import { Button } from "@/components/ui/button";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import type {
 MeasurementsProgressSummary,
 ProgressBlock,
 ProgressClientOption,
 ProgressPermissions,
} from "@/lib/progress/data";

import { DeltaBadge, LineTrendChart, ProgressCharts } from "./ProgressCharts";
import { BlockError, ProgressEmptyState } from "./ProgressEmptyState";
import { ProgressMetricGrid } from "./ProgressMetricGrid";
import {
 formatShortDate,
 formatValue,
 getLatestByKind,
 getMetricSeries,
 getPreviousByKind,
} from "./utils";

export function ProgressMeasurements({
 access,
 block,
 permissions,
 selectedClient,
}: {
 access: CurrentUserAccess;
 block: ProgressBlock<MeasurementsProgressSummary>;
 permissions: ProgressPermissions;
 selectedClient: ProgressClientOption;
}) {
 if (!permissions.canViewMeasurements) {
 return (
 <ProgressEmptyState
 description="No tienes acceso a las medidas de este cliente."
 title="Medidas no disponibles"
 />
 );
 }

 if (block.error) {
 if (
 block.errorCode === "client_not_found" ||
 block.errorCode === "permission_denied" ||
 block.errorCode === "selection_required"
 ) {
 return (
 <ProgressEmptyState
 description={block.error}
 title={
 block.errorCode === "client_not_found"
 ? "Cliente no encontrado"
 : "Medidas no disponibles"
 }
 />
 );
 }

 return <BlockError message={block.error} />;
 }

 const measurements = block.data;
 if (!measurements) {
 return <BlockError message="No pudimos cargar las medidas." />;
 }

 const weightEntry = getLatestByKind(measurements.entries, "weight");
 const previousWeightEntry = getPreviousByKind(measurements.entries, "weight");
 const bodyFatEntry = getLatestByKind(measurements.entries, "bodyFat");
 const previousBodyFatEntry = getPreviousByKind(measurements.entries, "bodyFat");
 const weightValue = weightEntry?.metric_value ?? measurements.profile.weightKg;
 const bodyFatValue =
 bodyFatEntry?.metric_value ?? measurements.profile.bodyFatPercentage;
 const latestRecord = measurements.entries[0]?.recorded_at ?? measurements.profile.updatedAt;
 const weightSeries = getMetricSeries(measurements.entries, "weight");
 const bodyFatSeries = getMetricSeries(measurements.entries, "bodyFat");
 const hasMeasurementEntries = measurements.entries.length > 0;

 if (!measurements.profile.exists && !hasMeasurementEntries) {
 return (
 <ProgressEmptyState
 action={
 !access.isClient ? (
 <Button asChild size="sm">
 <Link href={`/app/clientes/${selectedClient.id}`}>Ver cliente</Link>
 </Button>
 ) : null
 }
 description="El cliente todavia no tiene un perfil fisico guardado."
 title="Sin perfil fisico"
 />
 );
 }

 if (!measurements.profile.configured && !hasMeasurementEntries) {
 return (
 <ProgressEmptyState
 action={
 !access.isClient ? (
 <Button asChild size="sm">
 <Link href={`/app/clientes/${selectedClient.id}`}>Ver cliente</Link>
 </Button>
 ) : null
 }
 description="El cliente todavia no tiene peso, altura, grasa corporal ni medidas fisicas configuradas en su perfil."
 title="Perfil fisico sin configurar"
 />
 );
 }

 return (
 <div className="space-y-5">
 <ProgressMetricGrid
 items={[
 {
 detail: "Ultimo peso disponible",
 icon: Scale,
 label: "Peso",
 value: formatValue(weightValue, weightEntry?.metric_unit ?? "kg"),
 },
 {
 detail: "Ultima grasa corporal disponible",
 icon: HeartPulse,
 label: "Grasa",
 value: formatValue(bodyFatValue, bodyFatEntry?.metric_unit ?? "%"),
 },
 {
 detail: "Altura registrada en perfil",
 icon: UserRound,
 label: "Altura",
 value: formatValue(measurements.profile.heightCm, "cm"),
 },
 {
 detail: "Fecha de ultimo registro",
 icon: CalendarClock,
 label: "Ultimo registro",
 value: latestRecord ? formatShortDate(latestRecord) : "Sin dato",
 },
 ]}
 />

 <ProgressCharts>
 <div className="space-y-3">
 <LineTrendChart
 emptyLabel="No hay historial de peso para graficar."
 label="Peso por fecha"
 points={weightSeries}
 unit={weightEntry?.metric_unit ?? "kg"}
 />
 <DeltaBadge
 current={weightEntry?.metric_value}
 previous={previousWeightEntry?.metric_value}
 unit={weightEntry?.metric_unit ?? "kg"}
 />
 </div>
 <div className="space-y-3">
 <LineTrendChart
 emptyLabel="No hay historial de grasa corporal para graficar."
 label="Grasa corporal por fecha"
 points={bodyFatSeries}
 unit={bodyFatEntry?.metric_unit ?? "%"}
 />
 <DeltaBadge
 current={bodyFatEntry?.metric_value}
 previous={previousBodyFatEntry?.metric_value}
 unit={bodyFatEntry?.metric_unit ?? "%"}
 />
 </div>
 </ProgressCharts>

 <AppPanel title="Medidas fisicas">
 {measurements.profile.bodyMeasurements ? (
 <p className="rounded-[18px] bg-background p-4 text-sm leading-6 text-foreground">
 {measurements.profile.bodyMeasurements}
 </p>
 ) : (
 <EmptyState>No hay medidas fisicas adicionales registradas.</EmptyState>
 )}
 </AppPanel>
 </div>
 );
}
