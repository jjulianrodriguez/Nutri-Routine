import { useState } from "react";

import type {
 MultimediaResource,
 ResourceFolder,
} from "@/lib/resources/data";

import { CONTENT_FILTERS } from "../constants";
import type {
 ResourceContentFilter,
 ResourceFilter,
 ResourceStatusFilter,
} from "../types";
import {
 getFolderSearchText,
 getResourceSearchText,
 matchesFolderContent,
 matchesFolderStatus,
 matchesResourceContent,
 matchesResourceStatus,
 matchesSearch,
 normalizeSearchText,
} from "../utils";

type UseResourceFiltersParams = {
 activeFilter: ResourceFilter;
 canManage: boolean;
 folders: ResourceFolder[];
 initialContentFilter: ResourceContentFilter;
 initialSearchQuery: string;
 initialStatusFilter: ResourceStatusFilter;
 resources: MultimediaResource[];
 selectedFolderId?: string | null;
};

export function useResourceFilters({
 activeFilter,
 canManage,
 folders,
 initialContentFilter,
 initialSearchQuery,
 initialStatusFilter,
 resources,
 selectedFolderId,
}: UseResourceFiltersParams) {
 const initialSafeContentFilter =
 selectedFolderId && initialContentFilter === "folders"
 ? "all"
 : initialContentFilter;
 const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
 const [contentFilter, setContentFilter] = useState<ResourceContentFilter>(
 initialSafeContentFilter,
 );
 const [statusFilter, setStatusFilter] = useState<ResourceStatusFilter>(
 canManage ? initialStatusFilter : "all",
 );
 const selectedFolder = selectedFolderId
 ? folders.find((folder) => folder.id === selectedFolderId) ?? null
 : null;
 const effectiveContentFilter =
 selectedFolder && contentFilter === "folders" ? "all" : contentFilter;
 const effectiveStatusFilter = canManage ? statusFilter : "all";
 const normalizedSearchQuery = normalizeSearchText(searchQuery);
 const visibleContentFilters = selectedFolder
 ? CONTENT_FILTERS.filter((filter) => filter.value !== "folders")
 : CONTENT_FILTERS;
 const rootFolders = selectedFolder ? [] : folders;
 const resourcesInScope = selectedFolder
 ? resources.filter((resource) => resource.folder_id === selectedFolder.id)
 : resources.filter((resource) => !resource.folder_id);
 const filteredFolders = rootFolders.filter(
 (folder) =>
 matchesFolderContent(effectiveContentFilter) &&
 matchesFolderStatus(folder, effectiveStatusFilter) &&
 matchesSearch(getFolderSearchText(folder), normalizedSearchQuery),
 );
 const filteredResources = resourcesInScope.filter(
 (resource) =>
 matchesResourceContent(resource, effectiveContentFilter) &&
 matchesResourceStatus(resource, effectiveStatusFilter) &&
 matchesSearch(getResourceSearchText(resource), normalizedSearchQuery),
 );
 const hasAnyContentInScope =
 rootFolders.length > 0 || resourcesInScope.length > 0;
 const hasVisibleContent =
 filteredFolders.length > 0 || filteredResources.length > 0;
 const hasActiveLocalFilters =
 Boolean(normalizedSearchQuery) ||
 effectiveContentFilter !== "all" ||
 effectiveStatusFilter !== "all";
 const hasActiveFilters =
 hasActiveLocalFilters || (!selectedFolder && activeFilter !== "all");
 const visibleResultCount = filteredFolders.length + filteredResources.length;

 function clearLocalFilters() {
 setSearchQuery("");
 setContentFilter("all");
 setStatusFilter("all");
 }

 return {
 clearLocalFilters,
 contentFilter,
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
 statusFilter,
 visibleContentFilters,
 visibleResultCount,
 };
}
