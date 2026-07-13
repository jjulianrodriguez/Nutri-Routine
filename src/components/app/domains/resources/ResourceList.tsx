"use client";

import {
 ArrowLeft,
 ChevronRight,
 Plus,
} from "lucide-react";
import Link from "next/link";
import type { RefObject } from "react";

import { Button } from "@/components/ui/actions/button";
import type {
 MultimediaResource,
 ResourceFolder,
} from "@/lib/resources/data";

import { FolderCard } from "./FolderCard";
import { ResourceCard } from "./ResourceCard";
import { ResourceFilters } from "./ResourceFilters";
import type {
 ResourceArea,
 ResourceContentFilter,
 ResourceFilter,
 ResourceStatusFilter,
} from "./types";
import { buildResourcesHref } from "./utils";

export function ResourceList({
 activeFilter,
 canManage,
 clearLocalFilters,
 effectiveContentFilter,
 effectiveStatusFilter,
 emptyHint,
 emptyMessage,
 filteredFolders,
 filteredResources,
 formRef,
 hasActiveFilters,
 hasActiveLocalFilters,
 hasAnyContentInScope,
 hasVisibleContent,
 manageableAreas,
 onDeleteFolder,
 onDeleteResource,
 onEditExternalResource,
 onEditFolder,
 onEditPdfResource,
 onToggleFolder,
 onToggleResourceStatus,
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
 emptyHint?: string;
 emptyMessage?: string;
 filteredFolders: ResourceFolder[];
 filteredResources: MultimediaResource[];
 formRef: RefObject<HTMLDivElement | null>;
 hasActiveFilters: boolean;
 hasActiveLocalFilters: boolean;
 hasAnyContentInScope: boolean;
 hasVisibleContent: boolean;
 manageableAreas: ResourceArea[];
 onDeleteFolder: (folder: ResourceFolder) => void;
 onDeleteResource: (resource: MultimediaResource) => void;
 onEditExternalResource: (resource: MultimediaResource) => void;
 onEditFolder: (folder: ResourceFolder) => void;
 onEditPdfResource: (resource: MultimediaResource) => void;
 onToggleFolder: (folder: ResourceFolder) => void;
 onToggleResourceStatus: (resource: MultimediaResource) => void;
 searchQuery: string;
 selectedFolder: ResourceFolder | null;
 setContentFilter: (value: ResourceContentFilter) => void;
 setSearchQuery: (value: string) => void;
 setStatusFilter: (value: ResourceStatusFilter) => void;
 visibleAreaFilters: Array<{ label: string; value: ResourceFilter }>;
 visibleContentFilters: Array<{ label: string; value: ResourceContentFilter }>;
 visibleResultCount: number;
}) {
 const backHref = buildResourcesHref({
 area: activeFilter,
 content: effectiveContentFilter,
 q: searchQuery,
 status: effectiveStatusFilter,
 });

 return (
 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div className="min-w-0">
 {selectedFolder ? (
 <nav
 className="flex flex-wrap items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted"
 aria-label="Ruta de recursos"
 >
 <Link href={backHref} className="hover:text-primary-hover">
 Recursos
 </Link>
 <ChevronRight className="size-3.5" aria-hidden="true" />
 <span className="min-w-0 truncate">{selectedFolder.name}</span>
 </nav>
 ) : (
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Biblioteca de materiales
 </p>
 )}
 <h2 className="mt-2 break-words text-3xl font-semibold text-foreground">
 {selectedFolder ? selectedFolder.name : "Recursos disponibles"}
 </h2>
 <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
 {selectedFolder
 ? selectedFolder.description ||
 "Documentos y enlaces dentro de esta carpeta."
 : canManage
 ? "Carpetas, PDFs y enlaces visibles segun area, tipo y estado."
 : "Abre los materiales compartidos para acompanar tu plan."}
 </p>
 </div>

 {selectedFolder ? (
 <div className="flex flex-wrap gap-2">
 <Button asChild variant="outline">
 <Link href={backHref}>
 <ArrowLeft className="size-4" aria-hidden="true" />
 Volver a Recursos
 </Link>
 </Button>
 {canManage ? (
 <Button
 type="button"
 onClick={() =>
 formRef.current?.scrollIntoView({
 behavior: "smooth",
 block: "start",
 })
 }
 >
 <Plus className="size-4" aria-hidden="true" />
 Agregar recurso
 </Button>
 ) : null}
 </div>
 ) : null}
 </div>

 <ResourceFilters
 activeFilter={activeFilter}
 canManage={canManage}
 clearLocalFilters={clearLocalFilters}
 effectiveContentFilter={effectiveContentFilter}
 effectiveStatusFilter={effectiveStatusFilter}
 hasActiveFilters={hasActiveFilters}
 hasActiveLocalFilters={hasActiveLocalFilters}
 hasVisibleContent={hasVisibleContent}
 searchQuery={searchQuery}
 selectedFolder={selectedFolder}
 setContentFilter={setContentFilter}
 setSearchQuery={setSearchQuery}
 setStatusFilter={setStatusFilter}
 visibleAreaFilters={visibleAreaFilters}
 visibleContentFilters={visibleContentFilters}
 visibleResultCount={visibleResultCount}
 />

 {selectedFolder ? (
 filteredResources.length > 0 ? (
 <section className="mt-6" aria-labelledby="folder-resources-title">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h3
 id="folder-resources-title"
 className="text-lg font-extrabold text-foreground"
 >
 Documentos de la carpeta
 </h3>
 <p className="mt-1 text-sm text-muted">
 Solo se muestran recursos dentro de esta carpeta.
 </p>
 </div>
 <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-extrabold text-foreground">
 {filteredResources.length} recurso
 {filteredResources.length === 1 ? "" : "s"}
 </span>
 </div>
 <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
 {filteredResources.map((resource) => (
 <ResourceCard
 key={resource.id}
 canManage={
 canManage && manageableAreas.includes(resource.area)
 }
 onDelete={onDeleteResource}
 onEditExternal={onEditExternalResource}
 onEditPdf={onEditPdfResource}
 onToggleStatus={onToggleResourceStatus}
 resource={resource}
 />
 ))}
 </div>
 </section>
 ) : hasActiveLocalFilters ? (
 <div className="mt-6 rounded-[22px] bg-background px-5 py-12 text-center">
 <p className="font-extrabold text-foreground">
 No encontramos recursos con esos filtros.
 </p>
 <p className="mt-2 text-sm leading-6 text-muted">
 Prueba con otra busqueda o limpia los filtros.
 </p>
 </div>
 ) : (
 <div className="mt-6 rounded-[22px] bg-background px-5 py-12 text-center">
 <p className="font-extrabold text-foreground">
 Esta carpeta todavia no tiene documentos.
 </p>
 <p className="mt-2 text-sm leading-6 text-muted">
 {canManage
 ? "Agrega un PDF o enlace para empezar."
 : "Cuando haya recursos activos apareceran aqui."}
 </p>
 </div>
 )
 ) : hasVisibleContent ? (
 <div className="mt-6 space-y-7">
 {filteredFolders.length > 0 ? (
 <section aria-labelledby="resource-folders-title">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h3
 id="resource-folders-title"
 className="text-lg font-extrabold text-foreground"
 >
 Carpetas
 </h3>
 <p className="mt-1 text-sm text-muted">
 Organizacion principal de la biblioteca.
 </p>
 </div>
 <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-extrabold text-foreground">
 {filteredFolders.length} carpeta
 {filteredFolders.length === 1 ? "" : "s"}
 </span>
 </div>
 <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
 {filteredFolders.map((folder) => (
 <FolderCard
 key={folder.id}
 activeFilter={activeFilter}
 canManage={
 canManage && manageableAreas.includes(folder.area)
 }
 contentFilter={effectiveContentFilter}
 folder={folder}
 onDelete={onDeleteFolder}
 onEdit={onEditFolder}
 onToggleActive={onToggleFolder}
 searchQuery={searchQuery}
 statusFilter={effectiveStatusFilter}
 />
 ))}
 </div>
 </section>
 ) : null}

 {filteredResources.length > 0 ? (
 <section aria-labelledby="root-resources-title">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h3
 id="root-resources-title"
 className="text-lg font-extrabold text-foreground"
 >
 Recursos sin carpeta
 </h3>
 <p className="mt-1 text-sm text-muted">
 PDFs y enlaces disponibles en el nivel principal.
 </p>
 </div>
 <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-foreground">
 {filteredResources.length} recurso
 {filteredResources.length === 1 ? "" : "s"}
 </span>
 </div>
 <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
 {filteredResources.map((resource) => (
 <ResourceCard
 key={resource.id}
 canManage={
 canManage && manageableAreas.includes(resource.area)
 }
 onDelete={onDeleteResource}
 onEditExternal={onEditExternalResource}
 onEditPdf={onEditPdfResource}
 onToggleStatus={onToggleResourceStatus}
 resource={resource}
 />
 ))}
 </div>
 </section>
 ) : null}
 </div>
 ) : hasAnyContentInScope || hasActiveFilters ? (
 <div className="mt-6 rounded-[22px] bg-background px-5 py-12 text-center">
 <p className="font-extrabold text-foreground">
 No encontramos recursos con esos filtros.
 </p>
 <p className="mt-2 text-sm leading-6 text-muted">
 Prueba con otra busqueda, cambia el tipo o vuelve a Todos.
 </p>
 </div>
 ) : (
 <div className="mt-6 rounded-[22px] bg-background px-5 py-12 text-center">
 <p className="font-extrabold text-foreground">
 {emptyMessage ?? "Todavia no hay recursos disponibles."}
 </p>
 <p className="mt-2 text-sm leading-6 text-muted">
 {emptyHint ??
 (canManage
 ? "Crea una carpeta, sube un PDF o agrega un enlace."
 : "Tu profesional asignado puede compartir recursos contigo.")}
 </p>
 {canManage ? (
 <div className="mt-5 flex justify-center">
 <Button
 type="button"
 size="sm"
 onClick={() =>
 formRef.current?.scrollIntoView({
 behavior: "smooth",
 block: "start",
 })
 }
 >
 <Plus className="size-4" aria-hidden="true" />
 Crear recurso
 </Button>
 </div>
 ) : null}
 </div>
 )}
 </section>
 );
}