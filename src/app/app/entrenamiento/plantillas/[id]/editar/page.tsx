import { notFound, redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/layouts/AppScreen";
import {
 trainingSectionTabs,
} from "@/components/app/shared/section-tab-presets";
import { SectionTabs } from "@/components/app/shared/section-tabs";
import { WorkoutTemplateEditor } from "@/components/app/domains/training/workout-template-editor";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getRoutineManagementOverview } from "@/lib/routines/data";
import { getWorkoutTemplateDetailWithMeta } from "@/lib/workout-templates/data";

export default async function EditWorkoutTemplatePage({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const access = await requireRouteAccess("/app/entrenamiento/plantillas");

 if (!access.canManageTraining) {
 redirect("/app/entrenamiento");
 }

 const { id } = await params;
 const [templateResult, overview] = await Promise.all([
 getWorkoutTemplateDetailWithMeta(id),
 getRoutineManagementOverview(),
 ]);
 const { template, warning } = templateResult;

 if (!template) {
 notFound();
 }

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Editar plantilla"
 title={template.name}
 description="Actualiza la duración del ciclo y el entrenamiento asignado a cada día."
 />
 <SectionTabs
 activeId="templates"
 ariaLabel="Secciones de entrenamiento"
 items={trainingSectionTabs}
 />
 {warning ? (
 <Alert className="rounded-[22px] border-primary/30 bg-primary-tint/50 px-5 py-4">
 <AlertDescription className="font-semibold text-muted-foreground">
 {warning}
 </AlertDescription>
 </Alert>
 ) : null}
 <WorkoutTemplateEditor
 routines={overview.routines}
 template={template}
 />
 </AppScreen>
 );
}
