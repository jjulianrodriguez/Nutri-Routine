"use client";

import { forwardRef } from "react";
import {
 AlignCenter,
 AlignLeft,
 AlignRight,
 Bold,
 Eraser,
 Heading1,
 Heading2,
 Heading3,
 Italic,
 List,
 ListOrdered,
 Minus,
 Pilcrow,
 Quote,
 Redo2,
 Underline,
 Undo2,
} from "lucide-react";

import {
 TooltipProvider,
} from "@/components/ui/overlays/tooltip";
import { cn } from "@/lib/utils";

import type { EditorToolbarProps } from "../types";
import { ColorPicker } from "./ColorPicker";
import { MediaMenu } from "./MediaMenu";
import { SizeDropdown } from "./SizeDropdown";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarGroup } from "./ToolbarGroup";

export const EditorToolbar = forwardRef<HTMLDivElement, EditorToolbarProps>(
 (
 {
 editor,
 disabled = false,
 className,
 error = false,
 toolbarId,
 activeMenuId,
 setActiveMenuId,
 selectionState,
 commands,
 },
 ref,
 ) => {
 const toolbarDisabled = disabled || !editor;
 const activeTextAlign = selectionState.activeTextAlign;
 const activeTextColor = selectionState.activeTextColor;
 const activeHighlightColor = selectionState.activeHighlightColor;
 const activeTextSize = selectionState.activeTextSize;

 return (
 <TooltipProvider>
 <div
 ref={ref}
 className={cn(
 "relative z-30 flex items-center gap-2 overflow-x-auto bg-background/95 p-2 backdrop-blur-md sm:flex-wrap",
 error && "border-danger/40",
 className,
 )}
 aria-label="Herramientas de formato del blog"
 role="toolbar"
 >
 <ToolbarGroup label="Texto">
 <ToolbarButton
 active={editor?.isActive("bold")}
 disabled={toolbarDisabled}
 icon={Bold}
 label="Negrita"
 onClick={commands.toggleBold}
 />
 <ToolbarButton
 active={editor?.isActive("italic")}
 disabled={toolbarDisabled}
 icon={Italic}
 label="Cursiva"
 onClick={commands.toggleItalic}
 />
 <ToolbarButton
 active={editor?.isActive("underline")}
 disabled={toolbarDisabled}
 icon={Underline}
 label="Subrayado"
 onClick={commands.toggleUnderline}
 />
 <SizeDropdown
 disabled={toolbarDisabled}
 value={activeTextSize}
 onChange={commands.setTextSize}
 isOpen={activeMenuId === `${toolbarId}-size`}
 onOpenChange={(open) => setActiveMenuId(open ? `${toolbarId}-size` : null)}
 />
 </ToolbarGroup>

 <ToolbarGroup label="Estructura">
 <ToolbarButton
 active={editor?.isActive("paragraph")}
 disabled={toolbarDisabled}
 icon={Pilcrow}
 label="Parrafo"
 onClick={commands.setParagraph}
 />
 <ToolbarButton
 active={editor?.isActive("heading", { level: 1 })}
 disabled={toolbarDisabled}
 icon={Heading1}
 label="Titulo H1"
 onClick={() => commands.toggleHeading(1)}
 />
 <ToolbarButton
 active={editor?.isActive("heading", { level: 2 })}
 disabled={toolbarDisabled}
 icon={Heading2}
 label="Titulo H2"
 onClick={() => commands.toggleHeading(2)}
 />
 <ToolbarButton
 active={editor?.isActive("heading", { level: 3 })}
 disabled={toolbarDisabled}
 icon={Heading3}
 label="Titulo H3"
 onClick={() => commands.toggleHeading(3)}
 />
 </ToolbarGroup>

 <ToolbarGroup label="Color">
 <ColorPicker
 disabled={toolbarDisabled}
 kind="text"
 value={activeTextColor}
 onChange={commands.setTextColor}
 isOpen={activeMenuId === `${toolbarId}-color`}
 onOpenChange={(open) => setActiveMenuId(open ? `${toolbarId}-color` : null)}
 />
 <ColorPicker
 disabled={toolbarDisabled}
 kind="highlight"
 value={activeHighlightColor}
 onChange={commands.setHighlight}
 isOpen={activeMenuId === `${toolbarId}-highlight`}
 onOpenChange={(open) =>
 setActiveMenuId(open ? `${toolbarId}-highlight` : null)
 }
 />
 </ToolbarGroup>

 <ToolbarGroup label="Alineacion">
 <ToolbarButton
 active={activeTextAlign === "left"}
 disabled={toolbarDisabled}
 icon={AlignLeft}
 label="Alinear izquierda"
 onClick={() => commands.setTextAlign("left")}
 />
 <ToolbarButton
 active={activeTextAlign === "center"}
 disabled={toolbarDisabled}
 icon={AlignCenter}
 label="Alinear centro"
 onClick={() => commands.setTextAlign("center")}
 />
 <ToolbarButton
 active={activeTextAlign === "right"}
 disabled={toolbarDisabled}
 icon={AlignRight}
 label="Alinear derecha"
 onClick={() => commands.setTextAlign("right")}
 />
 <ToolbarButton
 active={editor?.isActive("bulletList")}
 disabled={toolbarDisabled}
 icon={List}
 label="Lista con vinetas"
 onClick={commands.toggleBulletList}
 />
 <ToolbarButton
 active={editor?.isActive("orderedList")}
 disabled={toolbarDisabled}
 icon={ListOrdered}
 label="Lista numerada"
 onClick={commands.toggleOrderedList}
 />
 </ToolbarGroup>

 <MediaMenu
 activeMenuId={activeMenuId}
 commands={commands}
 disabled={toolbarDisabled}
 editor={editor}
 setActiveMenuId={setActiveMenuId}
 toolbarId={toolbarId}
 />

 <ToolbarGroup label="Herramientas">
 <ToolbarButton
 active={editor?.isActive("blockquote")}
 disabled={toolbarDisabled}
 icon={Quote}
 label="Cita"
 onClick={commands.toggleBlockquote}
 />
 <ToolbarButton
 disabled={toolbarDisabled}
 icon={Minus}
 label="Separador"
 onClick={commands.insertHorizontalRule}
 />
 <ToolbarButton
 disabled={toolbarDisabled}
 icon={Eraser}
 label="Limpiar formato"
 onClick={commands.clearFormatting}
 />
 <ToolbarButton
 disabled={toolbarDisabled || !editor?.can().undo()}
 icon={Undo2}
 label="Deshacer"
 onClick={commands.undo}
 />
 <ToolbarButton
 disabled={toolbarDisabled || !editor?.can().redo()}
 icon={Redo2}
 label="Rehacer"
 onClick={commands.redo}
 />
 </ToolbarGroup>
 </div>
 </TooltipProvider>
 );
 },
);

EditorToolbar.displayName = "EditorToolbar";
