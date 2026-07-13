"use client";

import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";

import { BlogEditorSection } from "./blog-manager/blog-editor-section";
import { BlogLibrarySection } from "./blog-manager/blog-library-section";
import { useBlogManager } from "./blog-manager/hooks/use-blog-manager";
import type { BlogManagerProps } from "./blog-manager/types";

export function BlogManager(props: BlogManagerProps) {
 const manager = useBlogManager(props);
 const { confirmation } = manager;

 return (
  <div className={["grid gap-6", manager.showEditor && manager.isManageMode ? "xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start" : ""].filter(Boolean).join(" ")}>
   {manager.showEditor ? <BlogEditorSection manager={manager} /> : null}
   {manager.isManageMode ? <BlogLibrarySection manager={manager} /> : null}
   <ConfirmationDialog
    open={Boolean(confirmation)}
    onOpenChange={(open) => { if (!open) manager.setConfirmation(null); }}
    title={manager.confirmationTitle}
    description={manager.confirmationDescription}
    confirmLabel={manager.confirmationLabel}
    pendingLabel={confirmation?.type === "delete" ? "Eliminando…" : confirmation?.type === "update" ? "Guardando…" : "Actualizando…"}
    tone={confirmation?.type === "delete" ? "destructive" : "default"}
    onConfirm={manager.confirmAction}
   />
  </div>
 );
}
