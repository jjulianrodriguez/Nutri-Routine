"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/actions/button";
import { FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";

import { normalizeEditorUrl } from "../utils";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarPopover } from "./ToolbarPopover";

export function LinkPopover({
 disabled = false,
 editor,
 isOpen,
 onOpenChange,
}: {
 disabled?: boolean;
 editor: Editor | null;
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
}) {
 const triggerRef = useRef<HTMLButtonElement>(null);
 const [hrefValue, setHrefValue] = useState("");

 const applyLink = () => {
 if (!editor) {
 return;
 }

 const href = normalizeEditorUrl(hrefValue);

 if (!href) {
 toast.error("Usa una URL http(s), mailto:, tel: o una ruta interna.");
 return;
 }

 editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
 onOpenChange(false);
 };

 return (
 <>
 <ToolbarButton
 active={editor?.isActive("link")}
 ariaExpanded={isOpen}
 buttonRef={triggerRef}
 disabled={disabled}
 icon={LinkIcon}
 label="Agregar enlace"
 onClick={() => {
 setHrefValue(String(editor?.getAttributes("link").href ?? ""));
 onOpenChange(!isOpen);
 }}
 />

 <ToolbarPopover
 triggerRef={triggerRef}
 isOpen={isOpen}
 onOpenChange={onOpenChange}
 width={280}
 className="p-3"
 >
 <FormField
 controlId="editor-link-url"
 label="URL del enlace"
 labelClassName="text-[10px] uppercase tracking-wider text-muted"
 >
 <Input
 type="url"
 value={hrefValue}
 onChange={(event) => setHrefValue(event.target.value)}
 onKeyDown={(event) => {
 if (event.key === "Enter") {
 event.preventDefault();
 applyLink();
 }
 }}
 placeholder="https://..."
 className="h-10 rounded-[10px] bg-background px-3 font-semibold"
 size="sm"
 />
 </FormField>
 <div className="mt-3 flex items-center justify-end gap-2">
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onMouseDown={(event) => {
 event.preventDefault();
 onOpenChange(false);
 }}
 >
 Cancelar
 </Button>
 <Button
 type="button"
 size="sm"
 onMouseDown={(event) => {
 event.preventDefault();
 applyLink();
 }}
 >
 Aplicar
 </Button>
 </div>
 </ToolbarPopover>
 </>
 );
}
