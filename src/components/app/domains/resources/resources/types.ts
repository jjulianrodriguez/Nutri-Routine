import type { RefObject } from "react";

import type {
 MultimediaResource,
 ResourceFolder,
} from "@/lib/resources/data";
import type { ResourceValues } from "@/lib/validations/resources";
import type { Enums } from "@/types/database";

export type ResourceArea = Enums<"service_area">;
export type ResourceFilter = ResourceArea | "all";
export type ResourceContentFilter = "all" | "folders" | "links" | "pdf";
export type ResourceStatusFilter = "active" | "all" | "inactive";
export type ResourceFieldErrorMap = Record<string, string | undefined>;

export type ResourceManagerProps = {
 activeFilter: ResourceFilter;
 availableFilters?: ResourceFilter[];
 canManage: boolean;
 emptyHint?: string;
 emptyMessage?: string;
 folders: ResourceFolder[];
 initialContentFilter?: ResourceContentFilter;
 initialSearchQuery?: string;
 initialStatusFilter?: ResourceStatusFilter;
 manageableAreas?: ResourceArea[];
 resources: MultimediaResource[];
 selectedFolderId?: string | null;
};

export type ResourceConfirmation =
 | {
 resource: MultimediaResource;
 type: "delete-resource" | "toggle-resource";
 }
 | {
 resource: MultimediaResource;
 type: "update-external";
 values: ResourceValues;
 }
 | {
 folder: ResourceFolder;
 type: "delete-folder" | "toggle-folder";
 };

export type ResourceFormRef = RefObject<HTMLDivElement | null>;
