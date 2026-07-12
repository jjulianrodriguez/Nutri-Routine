"use client";

import Link from "next/link";

import { Button } from "@/components/ui/actions/button";
import { Label } from "@/components/ui/forms/label";
import { AREA_LABELS, STATUS_LABELS } from "@/lib/calendar/constants";
import type {
 CalendarFilters as CalendarFilterValues,
 CalendarPageData,
} from "@/lib/calendar/types";

import {
 buildCalendarHref,
 formatMonthLabel,
 selectClasses,
} from "./calendar-utils";

type CalendarFiltersProps = {
 data: CalendarPageData;
 onFilterChange: (overrides: Partial<CalendarFilterValues>) => void;
};

export function CalendarFilters({
 data,
 onFilterChange,
}: CalendarFiltersProps) {
 return (
 <>
 {data.canFilter ? (
 <div className="mt-5 grid gap-3 rounded-[22px] bg-background p-4 md:grid-cols-2 xl:grid-cols-4">
 <div>
 <Label htmlFor="calendar-client-filter">Cliente</Label>
 <select
 id="calendar-client-filter"
 value={data.filters.clientId}
 onChange={(event) =>
 onFilterChange({ clientId: event.currentTarget.value })
 }
 className={selectClasses}
 >
 <option value="">Todos</option>
 {data.clientOptions.map((client) => (
 <option key={client.id} value={client.id}>
 {client.fullName}
 {client.email ? ` - ${client.email}` : ""}
 </option>
 ))}
 </select>
 </div>

 {data.isAdmin ? (
 <div>
 <Label htmlFor="calendar-professional-filter">Profesional</Label>
 <select
 id="calendar-professional-filter"
 value={data.filters.professionalId}
 onChange={(event) =>
 onFilterChange({ professionalId: event.currentTarget.value })
 }
 className={selectClasses}
 >
 <option value="">Todos</option>
 {data.professionalOptions.map((professional) => (
 <option key={professional.id} value={professional.id}>
 {professional.fullName}
 </option>
 ))}
 </select>
 </div>
 ) : null}

 <div>
 <Label htmlFor="calendar-area-filter">Área</Label>
 <select
 id="calendar-area-filter"
 value={data.filters.area}
 onChange={(event) =>
 onFilterChange({
 area: event.currentTarget.value as CalendarFilterValues["area"],
 })
 }
 className={selectClasses}
 >
 <option value="all">Todas</option>
 {data.manageableAreas.map((area) => (
 <option key={area} value={area}>
 {AREA_LABELS[area]}
 </option>
 ))}
 </select>
 </div>

 <div>
 <Label htmlFor="calendar-status-filter">Estado</Label>
 <select
 id="calendar-status-filter"
 value={data.filters.status}
 onChange={(event) =>
 onFilterChange({
 status: event.currentTarget.value as CalendarFilterValues["status"],
 })
 }
 className={selectClasses}
 >
 <option value="all">Todos</option>
 {Object.entries(STATUS_LABELS).map(([value, label]) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </select>
 </div>
 </div>
 ) : null}

 <div className="mt-5 flex flex-wrap gap-2" aria-label="Meses cercanos">
 {data.eventMonthKeys.map((monthKey) => (
 <Button
 key={monthKey}
 asChild
 size="sm"
 variant={monthKey === data.monthKey ? "default" : "outline"}
 >
 <Link
 href={buildCalendarHref(data.filters, { month: monthKey })}
 aria-current={monthKey === data.monthKey ? "page" : undefined}
 >
 {formatMonthLabel(monthKey)}
 </Link>
 </Button>
 ))}
 </div>
 </>
 );
}