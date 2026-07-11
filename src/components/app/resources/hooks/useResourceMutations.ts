import { useState } from "react";
import type { RefObject } from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
 activateResource,
 createResource,
 deactivateResource,
 deleteResource,
 updateResource,
} from "@/lib/actions/resources";
import type { MultimediaResource } from "@/lib/resources/data";
import type { ResourceValues } from "@/lib/validations/resources";

import type { ResourceConfirmation } from "../types";

type UseResourceMutationsParams = {
 formRef: RefObject<HTMLDivElement | null>;
};

export function useResourceMutations({ formRef }: UseResourceMutationsParams) {
 const router = useRouter();
 const [editingExternalResource, setEditingExternalResource] =
 useState<MultimediaResource | null>(null);
 const [editingPdfResource, setEditingPdfResource] =
 useState<MultimediaResource | null>(null);
 const [confirmation, setConfirmation] =
 useState<ResourceConfirmation | null>(null);

 async function saveExternalResource(
 values: ResourceValues,
 resource: MultimediaResource | null,
 ) {
 const result = resource
 ? await updateResource({ ...values, id: resource.id })
 : await createResource(values);

 if (result.status === "error") {
 toast.error(result.message);
 throw result;
 }

 toast.success(result.message);
 setEditingExternalResource(null);
 router.refresh();
 }

 function startEditingExternal(resource: MultimediaResource) {
 setEditingPdfResource(null);
 setEditingExternalResource(resource);
 formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 }

 function startEditingPdf(resource: MultimediaResource) {
 setEditingExternalResource(null);
 setEditingPdfResource(resource);
 formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 }

 async function removeResource(resource: MultimediaResource) {
 const result = await deleteResource(resource.id);

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 if (editingExternalResource?.id === resource.id) {
 setEditingExternalResource(null);
 }
 if (editingPdfResource?.id === resource.id) {
 setEditingPdfResource(null);
 }
 router.refresh();
 }

 async function toggleResourceStatus(resource: MultimediaResource) {
 const result =
 resource.status === "active"
 ? await deactivateResource(resource.id)
 : await activateResource(resource.id);

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 toast.success(result.message);
 router.refresh();
 }

 return {
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
 };
}
