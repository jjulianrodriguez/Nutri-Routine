import { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
 deleteResourceFolder,
 toggleResourceFolderActive,
} from "@/lib/actions/resources";
import type { ResourceFolder } from "@/lib/resources/data";

export function useFolderOperations() {
 const router = useRouter();
 const [editingFolder, setEditingFolder] = useState<ResourceFolder | null>(
 null,
 );

 async function removeFolder(folder: ResourceFolder) {
 const result = await deleteResourceFolder(folder.id);

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.refresh();
 }

 async function toggleFolder(folder: ResourceFolder) {
 const result = await toggleResourceFolderActive(folder.id);

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.refresh();
 }

 return {
 editingFolder,
 removeFolder,
 setEditingFolder,
 toggleFolder,
 };
}