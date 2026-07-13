"use client";

import { SlidersHorizontal, X } from "lucide-react";

import { SectionTabs } from "@/components/app/shared/section-tabs";
import { Button } from "@/components/ui/actions/button";
import { FormField } from "@/components/ui/forms/form-field";
import { SearchField } from "@/components/ui/forms/search-field";
import type { ResourceFolder } from "@/lib/resources/data";

import { STATUS_FILTERS } from "./constants";
import type {
 ResourceContentFilter,
 ResourceFilter,
 ResourceStatusFilter,
} from "./types";
import { buildResourcesHref, getAreaLabel } from "./utils";

export function ResourceFilters({
 activeFilter,
 canManage,
 clearLocalFilters,
 effectiveContentFilter,
 effectiveStatusFilter,
 hasActiveFilters,
 hasActiveLocalFilters,
 hasVisibleContent,
 searchQuery,
 selectedFolder,
 setContentFilter,
 setSearchQuery,
 setStatusFilter,
 visibleAreaFilters,
 visibleContentFilters,
 visibleResultCount,
}: {
 activeFilter: ResourceFilter;
 canManage: boolean;
 clearLocalFilters: () => void;
 effectiveContentFilter: ResourceContentFilter;
 effectiveStatusFilter: ResourceStatusFilter;
 hasActiveFilters: boolean;
 hasActiveLocalFilters: boolean;
 hasVisibleContent: boolean;
 searchQuery: string;
 selectedFolder: ResourceFolder | null;
 setContentFilter: (value: ResourceContentFilter) => void;
 setSearchQuery: (value: string) => void;
 setStatusFilter: (value: ResourceStatusFilter) => void;
 visibleAreaFilters: Array<{ label: string; value: ResourceFilter }>;
 visibleContentFilters: Array<{ label: string; value: ResourceContentFilter }>;
 visibleResultCount: number;
}) {
 return (
 <div className="mt-5 rounded-[22px] bg-background p-4">
 <FormField
 controlId="resource-library-search"
 label="Buscar recursos"
 labelClassName="sr-only"
 >
 <SearchField
 value={searchQuery}
 onValueChange={setSearchQuery}
 placeholder="Buscar por titulo, carpeta, tipo o area"
 className="bg-surface text-foreground"
 autoComplete="off"
 size="lg"
 />
 </FormField>

 <div className="mt-4 grid gap-3 lg:grid-cols-3">
 {!selectedFolder ? (
 <div>
 <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 <SlidersHorizontal className="size-3.5" aria-hidden="true" />
 Area
 </p>
 <SectionTabs
 activeId={activeFilter}
 ariaLabel="Filtros de area de recursos"
 interaction="filters"
 items={visibleAreaFilters.map((filter) => ({
 href: buildResourcesHref({
 area: filter.value,
 content: effectiveContentFilter,
 q: searchQuery,
 status: effectiveStatusFilter,
 }),
 id: filter.value,
 label: filter.label,
 }))}
 size="sm"
 />
 </div>
 ) : (
 <div>
 <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Area
 </p>
 <span className="inline-flex min-h-9 items-center gap-1.5 rounded-control bg-surface px-3 text-sm font-bold text-foreground ">
 {getAreaLabel(selectedFolder.area)}
 </span>
 </div>
 )}

 <div>
 <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Tipo
 </p>
 <SectionTabs
 activeId={effectiveContentFilter}
 ariaLabel="Filtros de tipo de recursos"
 interaction="filters"
 items={visibleContentFilters.map((filter) => ({
 id: filter.value,
 label: filter.label,
 onClick: () => setContentFilter(filter.value),
 }))}
 size="sm"
 />
 </div>

 {canManage ? (
 <div>
 <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Estado
 </p>
 <SectionTabs
 activeId={effectiveStatusFilter}
 ariaLabel="Filtros de estado de recursos"
 interaction="filters"
 items={STATUS_FILTERS.map((filter) => ({
 id: filter.value,
 label: filter.label,
 onClick: () => setStatusFilter(filter.value),
 }))}
 size="sm"
 />
 </div>
 ) : null}
 </div>

 <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
 <p className="text-sm font-semibold text-muted">
 {hasVisibleContent
 ? `${visibleResultCount} resultado${visibleResultCount === 1 ? "" : "s"}`
 : hasActiveFilters
 ? "Sin resultados con los filtros actuales"
 : "Biblioteca sin materiales visibles"}
 </p>
 {hasActiveLocalFilters ? (
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={clearLocalFilters}
 >
 <X className="size-4" aria-hidden="true" />
 Limpiar filtros
 </Button>
 ) : null}
 </div>
 </div>
 );
}
