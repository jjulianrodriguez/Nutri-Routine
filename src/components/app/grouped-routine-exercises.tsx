import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { RoutineExerciseDetail } from "@/types/routine";

type GroupedRoutineExercisesProps = {
 className?: string;
 exercises: RoutineExerciseDetail[];
 groupClassName?: string;
 itemsClassName?: string;
 renderExercise: (
 item: RoutineExerciseDetail,
 originalIndex: number,
 ) => ReactNode;
};

type ExerciseGroup = {
 items: Array<{
 item: RoutineExerciseDetail;
 originalIndex: number;
 }>;
 label: string;
};

function getExerciseGroupLabel(item: RoutineExerciseDetail) {
 const muscleGroup = item.exercise.muscleGroup?.trim();

 if (muscleGroup) {
 return muscleGroup;
 }

 const category = item.exercise.category?.trim();

 return category || "Sin grupo";
}

function groupRoutineExercises(exercises: RoutineExerciseDetail[]) {
 const groupMap = new Map<string, ExerciseGroup>();

 exercises.forEach((item, originalIndex) => {
 const label = getExerciseGroupLabel(item);
 const group = groupMap.get(label);

 if (group) {
 group.items.push({ item, originalIndex });
 return;
 }

 groupMap.set(label, {
 items: [{ item, originalIndex }],
 label,
 });
 });

 return [...groupMap.values()];
}

export function GroupedRoutineExercises({
 className,
 exercises,
 groupClassName,
 itemsClassName = "space-y-3",
 renderExercise,
}: GroupedRoutineExercisesProps) {
 const groups = groupRoutineExercises(exercises);

 return (
 <div className={cn("space-y-5", className)}>
 {groups.map((group) => (
 <section key={group.label} className={groupClassName}>
 <div className="flex min-w-0 items-center gap-3">
 <p className="max-w-full rounded-full border-primary/25 bg-primary-soft/45 px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-foreground">
 {group.label}
 </p>
 <span className="hidden h-px min-w-8 flex-1 bg-border sm:block" />
 <span className="shrink-0 text-xs font-bold text-muted">
 {group.items.length}{" "}
 {group.items.length === 1 ? "ejercicio" : "ejercicios"}
 </span>
 </div>

 <div className={cn("mt-3", itemsClassName)}>
 {group.items.map(({ item, originalIndex }) =>
 renderExercise(item, originalIndex),
 )}
 </div>
 </section>
 ))}
 </div>
 );
}
