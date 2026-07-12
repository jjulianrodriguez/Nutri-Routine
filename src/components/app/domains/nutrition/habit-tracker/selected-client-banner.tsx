"use client";

import { UserRound } from "lucide-react";

import type { HabitClientOption } from "@/lib/habits/utils";

export function SelectedClientBanner({
 client,
}: {
 client: HabitClientOption;
}) {
 return (
 <div className="flex flex-wrap items-center gap-2 rounded-[20px] bg-surface px-4 py-3 text-sm font-extrabold text-foreground ">
 <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
 Viendo progreso de {client.fullName}
 </div>
 );
}
