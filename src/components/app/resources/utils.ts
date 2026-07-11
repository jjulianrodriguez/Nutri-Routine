import {
 FileText,
 ImageIcon,
 Link2,
 PlaySquare,
} from "lucide-react";

import { getExternalResourcePresentation } from "@/lib/exercises/multimedia";
import type {
 MultimediaResource,
 ResourceFolder,
} from "@/lib/resources/data";
import { getResourcePdfValidationError } from "@/lib/validations/resources";

import { AREA_DETAILS } from "./constants";
import type {
 ResourceArea,
 ResourceContentFilter,
 ResourceFilter,
 ResourceStatusFilter,
} from "./types";

export function formatDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
 dateStyle: "medium",
 timeStyle: "short",
 timeZone: "America/Costa_Rica",
 }).format(new Date(value));
}

export function formatFileSize(bytes: number | null) {
 if (!bytes || bytes <= 0) {
 return "PDF";
 }

 if (bytes < 1024 * 1024) {
 return `${Math.max(1, Math.round(bytes / 1024))} KB`;
 }

 return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function getUrlPresentation(value: string) {
 const presentation = getExternalResourcePresentation(value);
 const iconByType = {
 document: FileText,
 external: Link2,
 image: ImageIcon,
 video: PlaySquare,
 };

 return {
 domain: presentation.domain,
 icon: iconByType[presentation.type],
 kind: presentation.label,
 };
}

export function getAreaLabel(area: ResourceArea) {
 return AREA_DETAILS[area].label;
}

export function normalizeSearchText(value: string) {
 return value
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g, "")
 .toLowerCase()
 .trim();
}

export function getResourceKindLabel(resource: MultimediaResource) {
 return resource.kind === "pdf" ? "PDF" : "Enlace";
}

export function getResourceSearchText(resource: MultimediaResource) {
 return normalizeSearchText(
 [
 resource.title,
 resource.description,
 resource.folderName,
 getResourceKindLabel(resource),
 getAreaLabel(resource.area),
 AREA_DETAILS[resource.area].summary,
 resource.kind === "pdf" ? resource.file_name : resource.file_url,
 ]
 .filter(Boolean)
 .join(" "),
 );
}

export function getFolderSearchText(folder: ResourceFolder) {
 return normalizeSearchText(
 [
 folder.name,
 folder.description,
 "Carpeta",
 getAreaLabel(folder.area),
 AREA_DETAILS[folder.area].summary,
 ]
 .filter(Boolean)
 .join(" "),
 );
}

export function matchesSearch(haystack: string, query: string) {
 return !query || haystack.includes(query);
}

export function matchesResourceContent(
 resource: MultimediaResource,
 filter: ResourceContentFilter,
) {
 if (filter === "all") {
 return true;
 }

 if (filter === "pdf") {
 return resource.kind === "pdf";
 }

 if (filter === "links") {
 return resource.kind === "external_link";
 }

 return false;
}

export function matchesFolderContent(filter: ResourceContentFilter) {
 return filter === "all" || filter === "folders";
}

export function matchesResourceStatus(
 resource: MultimediaResource,
 filter: ResourceStatusFilter,
) {
 if (filter === "all") {
 return true;
 }

 return resource.status === filter;
}

export function matchesFolderStatus(
 folder: ResourceFolder,
 filter: ResourceStatusFilter,
) {
 if (filter === "all") {
 return true;
 }

 return filter === "active" ? folder.active : !folder.active;
}

export function readFileError(formData: FormData, required: boolean) {
 const value = formData.get("file");

 if (value instanceof File && value.size > 0) {
 return getResourcePdfValidationError(value);
 }

 return required ? "Selecciona un archivo PDF." : null;
}

export function buildResourcesHref({
 area,
 content,
 folderId,
 q,
 status,
}: {
 area?: ResourceFilter;
 content?: ResourceContentFilter;
 folderId?: string | null;
 q?: string;
 status?: ResourceStatusFilter;
}) {
 const params = new URLSearchParams();

 if (area && area !== "all") {
 params.set("area", area);
 }

 if (content && content !== "all") {
 params.set("type", content);
 }

 if (status && status !== "all") {
 params.set("status", status);
 }

 const search = q?.trim();

 if (search) {
 params.set("q", search);
 }

 if (folderId) {
 params.set("folder", folderId);
 }

 const query = params.toString();

 return query ? `/app/recursos?${query}` : "/app/recursos";
}
