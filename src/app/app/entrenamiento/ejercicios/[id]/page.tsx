import {
 ArrowLeft,
 CalendarDays,
 ExternalLink,
 FileText,
 Tag,
 Target,
 UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
 AppHeader,
 AppPanel,
 AppScreen,
} from "@/components/app/AppScreen";
import {
 trainingSectionTabs,
} from "@/components/app/section-tab-presets";
import { SectionTabs } from "@/components/app/section-tabs";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getExerciseDetail } from "@/lib/exercises/data";
import { getExternalResourcePresentation } from "@/lib/exercises/multimedia";
import type { ExerciseDifficulty } from "@/types/exercise";

const difficultyLabels: Record<ExerciseDifficulty, string> = {
 advanced: "Avanzado",
 beginner: "Principiante",
 intermediate: "Intermedio",
};

function readValue(value: string | null | undefined) {
 return value?.trim() || "No indicado";
}

function formatDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
 day: "2-digit",
 month: "long",
 year: "numeric",
 }).format(new Date(value));
}

export default async function ExerciseDetailPage({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const access = await requireRouteAccess("/app/entrenamiento");

 if (!access.canViewTraining) {
 redirect("/app");
 }

 const { id } = await params;
 const exercise = await getExerciseDetail(id);

 if (!exercise) {
 notFound();
 }

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Detalle de ejercicio"
 title={exercise.name}
 description="Información completa del ejercicio y sus indicaciones."
 />
 {access.canManageTraining ? (
 <SectionTabs
 activeId="exercises"
 ariaLabel="Secciones de entrenamiento"
 items={trainingSectionTabs}
 />
 ) : null}

 <div className="flex flex-wrap justify-between gap-3">
 <Button asChild variant="outline" size="lg">
 <Link
 href={
 access.canManageTraining
 ? "/app/entrenamiento/ejercicios"
 : "/app/entrenamiento"
 }
 >
 <ArrowLeft aria-hidden="true" />
 {access.canManageTraining
 ? "Volver a ejercicios"
 : "Volver a entrenamiento"}
 </Link>
 </Button>
 </div>

 <section>
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Nombre del ejercicio
 </p>
 <h2 className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
 {readValue(exercise.name)}
 </h2>
 </section>

 <AppPanel
 title="Descripción e instrucciones"
 description="Indicaciones disponibles para realizar el ejercicio."
 >
 <div className="h-fit self-start rounded-[20px] bg-surface p-4 ">
 <FileText
 className="size-4 text-muted-foreground"
 aria-hidden="true"
 />
 <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-7 text-foreground">
 {readValue(exercise.description)}
 </p>
 </div>
 </AppPanel>

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <DetailValue
 icon={Target}
 label="Grupo muscular"
 value={readValue(exercise.muscleGroup)}
 />
 <DetailValue
 icon={Tag}
 label="Dificultad"
 value={
 exercise.difficulty
 ? difficultyLabels[exercise.difficulty]
 : "No indicado"
 }
 />
 <DetailValue
 icon={Tag}
 label="Categoría"
 value={readValue(exercise.category)}
 />
 <DetailValue
 icon={Target}
 label="Tipo"
 value={readValue(exercise.exerciseType)}
 />
 </section>

 <AppPanel
 title="Materiales del ejercicio"
 description="Recursos propios de este ejercicio para revisar tecnica o referencia."
 >
 {exercise.multimediaUrls.length > 0 ? (
 <div className="grid items-start gap-3 lg:grid-cols-2">
 {exercise.multimediaUrls.map((url) => {
 const resource = getExternalResourcePresentation(url);

 return (
 <article
 key={url}
 className="h-fit self-start rounded-[20px] bg-surface p-4 "
 >
 <ExternalLink
 className="size-4 text-muted-foreground"
 aria-hidden="true"
 />
 <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 {resource.label}
 </p>
 <p
 className="mt-2 truncate text-sm font-semibold leading-6 text-foreground"
 translate="no"
 >
 {resource.domain}
 </p>
 <Button
 asChild
 variant="outline"
 size="sm"
 className="mt-4"
 >
 <a
 href={url}
 target="_blank"
 rel="noopener noreferrer"
 title={resource.domain}
 >
 <ExternalLink aria-hidden="true" />
 Abrir {resource.label}
 </a>
 </Button>
 </article>
 );
 })}
 </div>
 ) : (
 <div className="h-fit self-start rounded-[20px] bg-surface p-4 ">
 <ExternalLink
 className="size-4 text-muted-foreground"
 aria-hidden="true"
 />
 <p className="mt-3 font-extrabold text-foreground">
 No indicado
 </p>
 </div>
 )}
 </AppPanel>

 {access.canManageTraining ? (
 <AppPanel
 title="Estado y registro"
 description="Información administrativa del ejercicio."
 >
 <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
 <DetailValue
 icon={Target}
 label="Estado"
 value={exercise.isActive ? "Activo" : "Inactivo"}
 />
 <DetailValue
 icon={UserRound}
 label="Creador"
 value={readValue(exercise.creatorName)}
 />
 <DetailValue
 icon={CalendarDays}
 label="Creado"
 value={formatDate(exercise.createdAt)}
 />
 <DetailValue
 icon={CalendarDays}
 label="Actualizado"
 value={formatDate(exercise.updatedAt)}
 />
 </div>
 </AppPanel>
 ) : null}
 </AppScreen>
 );
}

function DetailValue({
 icon: Icon,
 label,
 value,
}: {
 icon: typeof Target;
 label: string;
 value: string;
}) {
 return (
 <div className="h-fit self-start rounded-[20px] bg-surface p-4 ">
 <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
 <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 {label}
 </p>
 <p className="mt-1 break-words font-extrabold text-foreground">
 {value}
 </p>
 </div>
 );
}
