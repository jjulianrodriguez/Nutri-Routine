"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Eye, EyeOff, Minimize2, PenLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/actions/button";
import { cn } from "@/lib/utils";

import { EditorCanvas } from "./components/EditorCanvas";
import { EditorToolbar } from "./components/EditorToolbar";
import { PreviewPanel } from "./components/PreviewPanel";
import {
 BlogHighlightExtension,
 BlogTextAlignExtension,
 BlogTextColorExtension,
 BlogTextSizeExtension,
} from "./extensions";
import { useEditorCommands } from "./hooks/useEditorCommands";
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
 const [isWritingMode, setIsWritingMode] = useState(false);
 const enterWritingModeButtonRef = useRef<HTMLButtonElement>(null);
 const containerRef = useRef<HTMLDivElement>(null);
 const mainToolbarRef = useRef<HTMLDivElement>(null);
 const closeActiveMenu = useCallback(() => setActiveMenuId(null), []);
 const isEmpty = !value.trim();
 const editor = useEditor({
 editable: !disabled,
 editorProps: {
 attributes: {
 "aria-describedby": describedBy ?? "",
 "aria-invalid": error ? "true" : "false",
 "aria-label": "Contenido del blog",
 "aria-multiline": "true",
 class: "text-base leading-8 text-foreground !outline-none !ring-0 !shadow-none",
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

 useEffect(() => {
 if (!isWritingMode) {
 return;
 }

 const body = document.body;
 const documentElement = document.documentElement;
 const scrollX = window.scrollX;
 const scrollY = window.scrollY;
 const previousBodyStyles = {
 left: body.style.left,
 overflow: body.style.overflow,
 position: body.style.position,
 top: body.style.top,
 width: body.style.width,
 };
 const previousDocumentOverflow = documentElement.style.overflow;

 body.style.left = `-${scrollX}px`;
 body.style.overflow = "hidden";
 body.style.position = "fixed";
 body.style.top = `-${scrollY}px`;
 body.style.width = "100%";
 documentElement.style.overflow = "hidden";

 return () => {
 body.style.left = previousBodyStyles.left;
 body.style.overflow = previousBodyStyles.overflow;
 body.style.position = previousBodyStyles.position;
 body.style.top = previousBodyStyles.top;
 body.style.width = previousBodyStyles.width;
 documentElement.style.overflow = previousDocumentOverflow;
 window.scrollTo(scrollX, scrollY);
 };
 }, [isWritingMode]);

 const enterWritingMode = useCallback(() => {
 closeActiveMenu();
 setIsWritingMode(true);

 window.requestAnimationFrame(() => {
 editor?.commands.focus();
 editor?.commands.scrollIntoView();
 });
 }, [closeActiveMenu, editor]);

 const exitWritingMode = useCallback(() => {
 closeActiveMenu();
 editor?.commands.blur();
 setIsWritingMode(false);

 window.requestAnimationFrame(() => {
 enterWritingModeButtonRef.current?.focus();
 });
 }, [closeActiveMenu, editor]);

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

 if (!isWritingMode) {
 return (
 <div
 ref={containerRef}
 data-writing-mode="false"
 className={cn(
 "min-w-0 overflow-hidden rounded-[26px] border bg-background shadow-[0_18px_50px_-42px_rgb(var(--foreground-rgb)/0.45)]",
 error && "border-danger/40",
 )}
 >
 <PreviewPanel
 content={value}
 action={
 <Button
 ref={enterWritingModeButtonRef}
 type="button"
 className="min-h-11 w-full sm:w-auto"
 onClick={enterWritingMode}
 >
 <PenLine className="size-4" aria-hidden="true" />
 Editar contenido
 </Button>
 }
 />
 </div>
 );
 }

 return (
 <div
 ref={containerRef}
 data-writing-mode="true"
 className={cn(
 "min-w-0 overflow-hidden border bg-background shadow-[0_18px_50px_-42px_rgb(var(--foreground-rgb)/0.45)]",
 "fixed inset-0 z-[100] flex w-full flex-col rounded-none border-0 shadow-none animate-in fade-in-0 zoom-in-[0.995] duration-200 motion-reduce:animate-none",
 error && "border-danger/40",
 )}
 >
 <div
 className={cn(
 "flex shrink-0 flex-col gap-4 border-b bg-surface-muted/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5",
 "pt-[max(1rem,env(safe-area-inset-top))] sm:px-6",
 )}
 >
 <div className="flex min-w-0 items-start gap-3">
 <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary-soft text-primary-hover">
 <PenLine className="size-4" aria-hidden="true" />
 </span>
 <div className="min-w-0">
 <p className="font-extrabold text-foreground">Modo escritura</p>
 <p className="mt-1 text-sm leading-5 text-muted">
 La página permanece fija mientras trabajas en el contenido.
 </p>
 </div>
 </div>
 <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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
 <Button
 type="button"
 className="min-h-11 w-full sm:w-auto"
 onClick={exitWritingMode}
 >
 <Minimize2 className="size-4" aria-hidden="true" />
 Salir del modo escritura
 </Button>
 </div>
 </div>

 <EditorToolbar
 ref={mainToolbarRef}
 {...toolbarProps}
 toolbarId="main"
 className={cn(
 "shrink-0 rounded-none border-x-0 border-t-0 border-b border-input",
 "sm:flex-nowrap",
 )}
 />

 <div
 className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface [scrollbar-gutter:stable]"
 >
 <EditorCanvas
 editor={editor}
 error={error}
 isEmpty={isEmpty}
 />

 {showPreview ? <PreviewPanel content={value} /> : null}
 </div>

 <div
 className={cn(
 "relative z-20 flex shrink-0 flex-col gap-3 border-t bg-surface-muted/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5",
 "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
 )}
 >
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
 </div>
 );
}
