"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/actions/button";
import { createNutritionDocumentSignedUrl } from "@/lib/actions/nutrition-documents";

export function PdfOpenButton({
 documentId,
 label = "Abrir PDF",
 variant = "outline",
}: {
 documentId: string;
 label?: string;
 variant?: "default" | "outline";
}) {
 const [isPending, setIsPending] = useState(false);

 async function openDocument() {
  setIsPending(true);
  try {
   const result = await createNutritionDocumentSignedUrl(documentId);
   if (result.status === "error" || !result.signedUrl) {
    toast.error(result.message);
    return;
   }
   window.open(result.signedUrl, "_blank", "noopener,noreferrer");
  } finally {
   setIsPending(false);
  }
 }

 return (
  <Button type="button" variant={variant} size="sm" onClick={openDocument} disabled={isPending} title={isPending ? "Preparando enlace seguro del PDF" : label}>
   {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
   {label}
  </Button>
 );
}
