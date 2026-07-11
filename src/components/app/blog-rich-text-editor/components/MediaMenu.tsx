"use client";

import type { Editor } from "@tiptap/core";
import { Unlink } from "lucide-react";

import type { EditorToolbarCommands } from "../types";
import { ImagePopover } from "./ImagePopover";
import { LinkPopover } from "./LinkPopover";
import { ToolbarButton } from "./ToolbarButton";
import { ToolbarGroup } from "./ToolbarGroup";

export function MediaMenu({
 activeMenuId,
 commands,
 disabled,
 editor,
 setActiveMenuId,
 toolbarId,
}: {
 activeMenuId: string | null;
 commands: EditorToolbarCommands;
 disabled: boolean;
 editor: Editor | null;
 setActiveMenuId: (id: string | null) => void;
 toolbarId: string;
}) {
 return (
 <ToolbarGroup label="Enlaces">
 <LinkPopover
 editor={editor}
 disabled={disabled}
 isOpen={activeMenuId === `${toolbarId}-link`}
 onOpenChange={(open) => setActiveMenuId(open ? `${toolbarId}-link` : null)}
 />
 <ToolbarButton
 disabled={disabled || !editor?.isActive("link")}
 icon={Unlink}
 label="Quitar enlace"
 onClick={commands.unsetLink}
 />
 <ImagePopover />
 </ToolbarGroup>
 );
}
