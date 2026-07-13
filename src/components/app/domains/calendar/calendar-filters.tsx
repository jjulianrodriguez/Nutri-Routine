"use client";

import Link from "next/link";

import { Button } from "@/components/ui/actions/button";
import { FormField } from "@/components/ui/forms/form-field";
import { Select } from "@/components/ui/forms/select";
import { AREA_LABELS, STATUS_LABELS } from "@/lib/calendar/constants";
import type {
 CalendarFilters as CalendarFilterValues,
 CalendarPageData,
} from "@/lib/calendar/types";

import {
 buildCalendarHref,
 formatMonthLabel,
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
 <FormField controlId="calendar-client-filter" label="Cliente">
 <Select
 value={data.filters.clientId}
 onChange={(event) =>
 onFilterChange({ clientId: event.currentTarget.value })
 }
 >
 <option value="">Todos</option>
 {data.clientOptions.map((client) => (
 <option key={client.id} value={client.id}>
 {client.fullName}
 {client.email ? ` - ${client.email}` : ""}
 </option>
 ))}
 </Select>
 </FormField>

 {data.isAdmin ? (
 <FormField controlId="calendar-professional-filter" label="Profesional">
 <Select
 value={data.filters.professionalId}
 onChange={(event) =>
 onFilterChange({ professionalId: event.currentTarget.value })
 }
 >
 <option value="">Todos</option>
 {data.professionalOptions.map((professional) => (
 <option key={professional.id} value={professional.id}>
 {professional.fullName}
 </option>
 ))}
 </Select>
 </FormField>
 ) : null}

 <FormField controlId="calendar-area-filter" label="Área">
 <Select
 value={data.filters.area}
 onChange={(event) =>
 onFilterChange({
 area: event.currentTarget.value as CalendarFilterValues["area"],
 })
 }
 >
 <option value="all">Todas</option>
 {data.manageableAreas.map((area) => (
 <option key={area} value={area}>
 {AREA_LABELS[area]}
 </option>
 ))}
 </Select>
 </FormField>

 <FormField controlId="calendar-status-filter" label="Estado">
 <Select
 value={data.filters.status}
 onChange={(event) =>
 onFilterChange({
 status: event.currentTarget.value as CalendarFilterValues["status"],
 })
 }
 >
 <option value="all">Todos</option>
 {Object.entries(STATUS_LABELS).map(([value, label]) => (
 <option key={value} value={value}>
 {label}
 </option>
 ))}
 </Select>
 </FormField>
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
