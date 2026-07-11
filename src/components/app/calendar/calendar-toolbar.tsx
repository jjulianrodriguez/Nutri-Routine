"use client";

import { CalendarCheck, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CalendarPageData } from "@/lib/calendar/types";

import { buildCalendarHref } from "./calendar-utils";

type CalendarToolbarProps = {
 canCreate: boolean;
 data: CalendarPageData;
 monthLabel: string;
 onCreate: () => void;
 onTodayClick: () => void;
 selectedIsToday: boolean;
 todayMonthKey: string;
};

export function CalendarToolbar({
 canCreate,
 data,
 monthLabel,
 onCreate,
 onTodayClick,
 selectedIsToday,
 todayMonthKey,
}: CalendarToolbarProps) {
 return (
 <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Vista mensual
 </p>
 <h2 className="mt-2 font-heading text-3xl font-bold capitalize text-foreground">
 {monthLabel}
 </h2>
 <p className="mt-2 text-sm leading-6 text-muted">
 {data.events.length === 1
 ? "1 evento visible este mes."
 : `${data.events.length} eventos visibles este mes.`}
 </p>
 </div>

 <div className="flex flex-wrap gap-2">
 {todayMonthKey === data.monthKey ? (
 <Button
 type="button"
 variant={selectedIsToday ? "default" : "outline"}
 size="sm"
 onClick={onTodayClick}
 >
 <CalendarCheck className="size-4" aria-hidden="true" />
 Hoy
 </Button>
 ) : (
 <Button asChild variant="outline" size="sm">
 <Link
 href={buildCalendarHref(data.filters, {
 month: todayMonthKey,
 })}
 >
 <CalendarCheck className="size-4" aria-hidden="true" />
 Hoy
 </Link>
 </Button>
 )}
 <Button asChild variant="outline" size="sm">
 <Link
 href={buildCalendarHref(data.filters, {
 month: data.previousMonthKey,
 })}
 >
 <ChevronLeft className="size-4" aria-hidden="true" />
 Anterior
 </Link>
 </Button>
 <Button asChild variant="outline" size="sm">
 <Link
 href={buildCalendarHref(data.filters, {
 month: data.nextMonthKey,
 })}
 >
 Siguiente
 <ChevronRight className="size-4" aria-hidden="true" />
 </Link>
 </Button>
 {canCreate ? (
 <Button type="button" size="sm" onClick={onCreate}>
 <Plus className="size-4" aria-hidden="true" />
 Crear evento
 </Button>
 ) : null}
 </div>
 </div>
 );
}
