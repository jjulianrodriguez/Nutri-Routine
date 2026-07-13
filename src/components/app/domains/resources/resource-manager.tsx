"use client";

import { useRef } from "react";

import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";

import { ExternalResourceForm } from "./ExternalResourceForm";
import { FolderManager } from "./FolderManager";
import { useFolderOperations } from "./hooks/useFolderOperations";
import { useResourceFilters } from "./hooks/useResourceFilters";
import { useResourceMutations } from "./hooks/useResourceMutations";
import { ResourceList } from "./ResourceList";
import {
 ResourcePdfEditForm,
 ResourceUploadForm,
} from "./ResourceUploadForm";
import { FILTERS } from "./constants";
import type { ResourceConfirmation, ResourceManagerProps } from "./types";

function getConfirmationCopy(confirmation: ResourceConfirmation | null) {
 let confirmTitle = "";
 let confirmDescription = "";
 let confirmLabel = "";
 let pendingLabel = "";
 let confirmTone: "default" | "destructive" = "default";

 if (confirmation) {
 if (confirmation.type === "delete-resource") {
 confirmTitle = "Eliminar recurso";
 confirmDescription = `Se eliminara "${confirmation.resource.title}". Si es un PDF propio de Recursos tambien se eliminara de Storage.`;
 confirmLabel = "Eliminar recurso";
 pendingLabel = "Eliminando";
 confirmTone = "destructive";
 } else if (confirmation.type === "toggle-resource") {
 const active = confirmation.resource.status === "active";
 confirmTitle = active ? "Desactivar recurso" : "Activar recurso";
 confirmDescription = active
 ? `El recurso "${confirmation.resource.title}" dejara de estar visible para clientas.`
 : `El recurso "${confirmation.resource.title}" volvera a estar visible segun permisos.`;
 confirmLabel = active ? "Desactivar" : "Activar";
 pendingLabel = active ? "Desactivando" : "Activando";
 confirmTone = active ? "destructive" : "default";
 } else if (confirmation.type === "update-external") {
 confirmTitle = "Guardar cambios";
 confirmDescription = `Se actualizara "${confirmation.values.title}" con la informacion del formulario.`;
 confirmLabel = "Guardar cambios";
 pendingLabel = "Guardando";
 } else if (confirmation.type === "delete-folder") {
 confirmTitle = "Eliminar carpeta";
 confirmDescription = `Se eliminara la carpeta "${confirmation.folder.name}" porque no tiene documentos.`;
 confirmLabel = "Eliminar carpeta";
 pendingLabel = "Eliminando";
 confirmTone = "destructive";
 } else if (confirmation.type === "toggle-folder") {
 const active = confirmation.folder.active;
 confirmTitle = active ? "Desactivar carpeta" : "Activar carpeta";
 confirmDescription = active
 ? `La carpeta "${confirmation.folder.name}" y sus documentos se ocultaran para clientas.`
 : `La carpeta "${confirmation.folder.name}" volvera a estar visible segun permisos.`;
 confirmLabel = active ? "Desactivar" : "Activar";
 pendingLabel = active ? "Desactivando" : "Activando";
 confirmTone = active ? "destructive" : "default";
 }
 }

 return {
 confirmDescription,
 confirmLabel,
 confirmTitle,
 confirmTone,
 pendingLabel,
 };
}

export function ResourceManager({
 activeFilter,
 availableFilters = FILTERS.map((filter) => filter.value),
 canManage,
 emptyHint,
 emptyMessage,
 folders,
 initialContentFilter = "all",
 initialSearchQuery = "",
 initialStatusFilter = "all",
 manageableAreas = ["training", "nutrition", "general"],
 resources,
 selectedFolderId,
}: ResourceManagerProps) {
 const formRef = useRef<HTMLDivElement>(null);
 const {
 clearLocalFilters,
 effectiveContentFilter,
 effectiveStatusFilter,
 filteredFolders,
 filteredResources,
 hasActiveFilters,
 hasActiveLocalFilters,
 hasAnyContentInScope,
 hasVisibleContent,
 searchQuery,
 selectedFolder,
 setContentFilter,
 setSearchQuery,
 setStatusFilter,
 visibleContentFilters,
 visibleResultCount,
 } = useResourceFilters({
 activeFilter,
 canManage,
 folders,
 initialContentFilter,
 initialSearchQuery,
 initialStatusFilter,
 resources,
 selectedFolderId,
 });
 const visibleAreaFilters = FILTERS.filter((filter) =>
 availableFilters.includes(filter.value),
 );
 const folderOperations = useFolderOperations();
 const resourceMutations = useResourceMutations({ formRef });
 const {
 confirmation,
 editingExternalResource,
 editingPdfResource,
 removeResource,
 saveExternalResource,
 setConfirmation,
 setEditingExternalResource,
 setEditingPdfResource,
 startEditingExternal,
 startEditingPdf,
 toggleResourceStatus,
 } = resourceMutations;
 const {
 editingFolder,
 removeFolder,
 setEditingFolder,
 toggleFolder,
 } = folderOperations;
 const confirmationCopy = getConfirmationCopy(confirmation);
 const library = (
 <ResourceList
 activeFilter={activeFilter}
 canManage={canManage}
 clearLocalFilters={clearLocalFilters}
 effectiveContentFilter={effectiveContentFilter}
 effectiveStatusFilter={effectiveStatusFilter}
 emptyHint={emptyHint}
 emptyMessage={emptyMessage}
 filteredFolders={filteredFolders}
 filteredResources={filteredResources}
 formRef={formRef}
 hasActiveFilters={hasActiveFilters}
 hasActiveLocalFilters={hasActiveLocalFilters}
 hasAnyContentInScope={hasAnyContentInScope}
 hasVisibleContent={hasVisibleContent}
 manageableAreas={manageableAreas}
 onDeleteFolder={(folder) =>
 setConfirmation({ folder, type: "delete-folder" })
 }
 onDeleteResource={(resource) =>
 setConfirmation({ resource, type: "delete-resource" })
 }
 onEditExternalResource={startEditingExternal}
 onEditFolder={setEditingFolder}
 onEditPdfResource={startEditingPdf}
 onToggleFolder={(folder) =>
 setConfirmation({ folder, type: "toggle-folder" })
 }
 onToggleResourceStatus={(resource) =>
 setConfirmation({ resource, type: "toggle-resource" })
 }
 searchQuery={searchQuery}
 selectedFolder={selectedFolder}
 setContentFilter={setContentFilter}
 setSearchQuery={setSearchQuery}
 setStatusFilter={setStatusFilter}
 visibleAreaFilters={visibleAreaFilters}
 visibleContentFilters={visibleContentFilters}
 visibleResultCount={visibleResultCount}
 />
 );

 async function confirmAction() {
 if (!confirmation) {
 return;
 }

 switch (confirmation.type) {
 case "delete-resource":
 await removeResource(confirmation.resource);
 break;
 case "toggle-resource":
 await toggleResourceStatus(confirmation.resource);
 break;
 case "update-external":
 await saveExternalResource(
 confirmation.values,
 confirmation.resource,
 );
 break;
 case "delete-folder":
 await removeFolder(confirmation.folder);
 break;
 case "toggle-folder":
 await toggleFolder(confirmation.folder);
 break;
 }
 }

 if (!canManage) {
 return library;
 }

 return (
 <div className="space-y-6">
 <div className="grid items-start gap-6 xl:grid-cols-2">
 {editingPdfResource ? (
 <div ref={formRef}>
 <ResourcePdfEditForm
 folders={folders}
 manageableAreas={manageableAreas}
 onCancel={() => setEditingPdfResource(null)}
 resource={editingPdfResource}
 />
 </div>
 ) : (
 <ExternalResourceForm
 key={
 editingExternalResource?.id ??
 `new-external-${selectedFolder?.id ?? "root"}`
 }
 editingResource={editingExternalResource}
 formRef={formRef}
 folders={folders}
 manageableAreas={manageableAreas}
 onCancel={() => setEditingExternalResource(null)}
 onSave={async (values, resource) => {
 if (resource) {
 setConfirmation({
 resource,
 type: "update-external",
 values,
 });
 return;
 }

 await saveExternalResource(values, null);
 }}
 selectedFolder={selectedFolder}
 />
 )}

 <ResourceUploadForm
 key={`pdf-upload-${selectedFolder?.id ?? "root"}`}
 folders={folders}
 manageableAreas={manageableAreas}
 selectedFolder={selectedFolder}
 />
 </div>

 <FolderManager
 editingFolder={editingFolder}
 folders={folders}
 manageableAreas={manageableAreas}
 onDelete={(folder) =>
 setConfirmation({ folder, type: "delete-folder" })
 }
 onEditingFolderChange={setEditingFolder}
 onToggleActive={(folder) =>
 setConfirmation({ folder, type: "toggle-folder" })
 }
 />

 {library}

 <ConfirmationDialog
 open={Boolean(confirmation)}
 onOpenChange={(open) => {
 if (!open) {
 setConfirmation(null);
 }
 }}
 title={confirmationCopy.confirmTitle}
 description={confirmationCopy.confirmDescription}
 confirmLabel={confirmationCopy.confirmLabel}
 pendingLabel={confirmationCopy.pendingLabel}
 tone={confirmationCopy.confirmTone}
 onConfirm={confirmAction}
 />
 </div>
 );
}
