"use client";

import {
 Download,
 ExternalLink,
 FileText,
 Link2,
 Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createResourceSignedUrl } from "@/lib/actions/resources";
import type { MultimediaResource } from "@/lib/resources/data";
import { cn } from "@/lib/utils";

import { getUrlPresentation } from "./utils";

function PdfActionButton({
 download = false,
 resourceId,
}: {
 download?: boolean;
 resourceId: string;
}) {
 const [isPending, setIsPending] = useState(false);

 async function openPdf() {
 setIsPending(true);

 try {
 const result = await createResourceSignedUrl(resourceId, { download });

 if (result.status === "error" || !result.signedUrl) {
 toast.error(result.message);
 return;
 }

 window.open(result.signedUrl, "_blank", "noopener,noreferrer");
 } finally {
 setIsPending(false);
 }
 }

 const Icon = download ? Download : ExternalLink;

 return (
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={openPdf}
 disabled={isPending}
 >
 {isPending ? (
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 ) : (
 <Icon className="size-4" aria-hidden="true" />
 )}
 {download ? "Descargar" : "Abrir PDF"}
 </Button>
 );
}

export function ResourcePreviewIcon({
 resource,
}: {
 resource: MultimediaResource;
}) {
 const isPdf = resource.kind === "pdf";
 const presentation =
 !isPdf && resource.file_url ? getUrlPresentation(resource.file_url) : null;
 const PreviewIcon = isPdf ? FileText : presentation?.icon ?? Link2;

 return (
 <div
 className={cn(
 "grid size-12 shrink-0 place-items-center rounded-[16px] ",
 isPdf ? "bg-primary-soft text-primary-hover" : "bg-secondary-soft text-muted-foreground",
 )}
 >
 <PreviewIcon className="size-5" aria-hidden="true" />
 </div>
 );
}

export function ResourcePreview({
 resource,
}: {
 resource: MultimediaResource;
}) {
 const isPdf = resource.kind === "pdf";

 return (
 <div className="mt-4 flex flex-wrap gap-2">
 {isPdf ? (
 <>
 <PdfActionButton resourceId={resource.id} />
 <PdfActionButton resourceId={resource.id} download />
 </>
 ) : resource.file_url ? (
 <Button asChild variant="outline" size="sm">
 <a
 href={resource.file_url}
 target="_blank"
 rel="noopener noreferrer"
 >
 <ExternalLink className="size-4" aria-hidden="true" />
 Abrir enlace
 </a>
 </Button>
 ) : null}
 </div>
 );
}
