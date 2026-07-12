"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/actions/button";
import { cn } from "@/lib/utils";

import { EditorCanvas } from "./components/EditorCanvas";
import { EditorToolbar } from "./components/EditorToolbar";
import { FloatingToolbar } from "./components/FloatingToolbar";
import { PreviewPanel } from "./components/PreviewPanel";
import {
 BlogHighlightExtension,
 BlogTextAlignExtension,
 BlogTextColorExtension,
 BlogTextSizeExtension,
} from "./extensions";
import { useEditorCommands } from "./hooks/useEditorCommands";
import { useFloatingToolbar } from "./hooks/useFloatingToolbar";
import { useSelectionState } from "./hooks/useSelectionState";
import type { BlogRichTextEditorProps } from "./types";
import { getEditorHtml, isAllowedEditorUrl } from "./utils";

export function BlogRichTextEditor({
 describedBy,
 disabled = false,
 error = false,
 id,
 onBlur,
 onChange,
 value,
}: BlogRichTextEditorProps) {
 const [showPreview, setShowPreview] = useState(false);
 const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
 const closeActiveMenu = useCallback(() => setActiveMenuId(null), []);
 const {
 containerRef,
 floatingStyle,
 mainToolbarRef,
 showFloatingToolbar,
 } = useFloatingToolbar(closeActiveMenu);
 const isEmpty = !value.trim();
 const editor = useEditor({
 editable: !disabled,
 editorProps: {
 attributes: {
 "aria-describedby": describedBy ?? "",
 "aria-invalid": error ? "true" : "false",
 "aria-label": "Contenido del blog",
 "aria-multiline": "true",
 class:
 "min-h-[20rem] px-4 py-4 text-base leading-7 text-foreground outline-none sm:px-5",
 id,
 role: "textbox",
 },
 },
 extensions: [
 BlogTextAlignExtension,
 BlogTextColorExtension,
 BlogTextSizeExtension,
 BlogHighlightExtension,
 StarterKit.configure({
 code: false,
 codeBlock: false,
 heading: {
 levels: [1, 2, 3],
 },
 link: {
 HTMLAttributes: {
 rel: "noopener noreferrer",
 target: "_blank",
 },
 autolink: true,
 defaultProtocol: "https",
 isAllowedUri: (url, context) =>
 !url.trim().startsWith("//") &&
 (isAllowedEditorUrl(url) || context.defaultValidate(url)),
 openOnClick: false,
 protocols: ["http", "https", "mailto", "tel"],
 },
 strike: false,
 }),
 Placeholder.configure({
 placeholder: "Escribe el contenido del blog...",
 }),
 ],
 immediatelyRender: false,
 onBlur: () => {
 onBlur?.();
 },
 onUpdate: ({ editor: currentEditor }) => {
 onChange(getEditorHtml(currentEditor));
 },
 });
 const selectionState = useSelectionState(editor, value);
 const commands = useEditorCommands(editor, setActiveMenuId);

 useEffect(() => {
 if (!editor) {
 return;
 }

 const currentHtml = getEditorHtml(editor);

 if (value !== currentHtml) {
 editor.commands.setContent(value || "", { emitUpdate: false });
 }
 }, [editor, value]);

 useEffect(() => {
 editor?.setEditable(!disabled);
 }, [disabled, editor]);

 const contentLength = value.trim().length;
 const isNearContentLimit = contentLength >= 45000;
 const toolbarProps = {
 editor,
 disabled,
 error,
 activeMenuId,
 setActiveMenuId,
 selectionState,
 commands,
 };

 return (
 <div ref={containerRef}>
 <EditorToolbar
 ref={mainToolbarRef}
 {...toolbarProps}
 toolbarId="main"
 className="rounded-t-[22px] border border-input "
 />

 <FloatingToolbar
 {...toolbarProps}
 floatingStyle={floatingStyle}
 isVisible={showFloatingToolbar}
 />

 <EditorCanvas editor={editor} error={error} isEmpty={isEmpty} />

 <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
 <div className="text-xs font-semibold leading-5 text-muted">
 <p>
 Formato permitido: titulos, listas, enlaces seguros, citas,
 alineacion, color de paleta y resaltado.
 </p>
 <p
 className={cn(
 "mt-1",
 isNearContentLimit && "font-extrabold text-danger",
 )}
 >
 {selectionState.wordCount} palabras / {selectionState.textLength}{" "}
 caracteres de texto / {contentLength.toLocaleString("es-CR")} de
 50 000 caracteres guardables.
 </p>
 </div>
 <Button
 type="button"
 variant={showPreview ? "secondary" : "outline"}
 size="sm"
 onClick={() => setShowPreview((current) => !current)}
 >
 {showPreview ? "Ocultar vista previa" : "Vista previa"}
 </Button>
 </div>

 {showPreview ? <PreviewPanel content={value} /> : null}
 </div>
 );
}