"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Eye, EyeOff, PenLine } from "lucide-react";
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
 class: "text-base leading-8 text-foreground outline-none",
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
 placeholder: "Empieza a escribir tu publicación…",
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
 <div
 ref={containerRef}
 className={cn(
 "min-w-0 overflow-hidden rounded-[26px] border bg-background shadow-[0_18px_50px_-42px_rgb(var(--foreground-rgb)/0.45)]",
 error && "border-danger/40",
 )}
 >
 <div className="flex flex-col gap-4 border-b bg-surface-muted/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
 <div className="flex min-w-0 items-start gap-3">
 <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary-soft text-primary-hover">
 <PenLine className="size-4" aria-hidden="true" />
 </span>
 <div className="min-w-0">
 <p className="font-extrabold text-foreground">Espacio de escritura</p>
 <p className="mt-1 text-sm leading-5 text-muted">
 Da formato al texto y revisa el resultado antes de publicar.
 </p>
 </div>
 </div>
 <Button
 type="button"
 variant={showPreview ? "secondary" : "outline"}
 size="sm"
 className="w-full sm:w-auto"
 onClick={() => setShowPreview((current) => !current)}
 aria-expanded={showPreview}
 >
 {showPreview ? (
 <EyeOff className="size-4" aria-hidden="true" />
 ) : (
 <Eye className="size-4" aria-hidden="true" />
 )}
 {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
 </Button>
 </div>

 <EditorToolbar
 ref={mainToolbarRef}
 {...toolbarProps}
 toolbarId="main"
 className="rounded-none border-x-0 border-t-0 border-b border-input"
 />

 <FloatingToolbar
 {...toolbarProps}
 floatingStyle={floatingStyle}
 isVisible={showFloatingToolbar}
 />

 <EditorCanvas editor={editor} error={error} isEmpty={isEmpty} />

 <div className="flex flex-col gap-3 border-t bg-surface-muted/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
 <div className="text-xs font-semibold leading-5 text-muted">
 <p>
 Puedes usar títulos, listas, enlaces, citas, alineación, color y
 resaltado.
 </p>
 </div>
 <p
 className={cn(
 "shrink-0 text-xs font-extrabold tabular-nums text-muted",
 isNearContentLimit && "text-danger",
 )}
 aria-live="polite"
 >
 {selectionState.wordCount} palabras · {selectionState.textLength}{" "}
 caracteres de texto · {contentLength.toLocaleString("es-CR")} / 50 000
 </p>
 </div>

 {showPreview ? <PreviewPanel content={value} /> : null}
 </div>
 );
}
