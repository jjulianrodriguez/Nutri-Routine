import type { Editor } from "@tiptap/core";
import type { LucideIcon } from "lucide-react";
import type { RefObject } from "react";

export type BlogRichTextEditorProps = {
 describedBy?: string;
 disabled?: boolean;
 error?: boolean;
 id: string;
 onBlur?: () => void;
 onChange: (value: string) => void;
 value: string;
};

export const BLOG_TEXT_ALIGNMENTS = ["left", "center", "right"] as const;

export type BlogTextAlign = (typeof BLOG_TEXT_ALIGNMENTS)[number];

export type ToolbarButtonProps = {
 active?: boolean;
 ariaExpanded?: boolean;
 buttonRef?: RefObject<HTMLButtonElement | null>;
 disabled?: boolean;
 icon: LucideIcon;
 label: string;
 onClick: () => void;
};

export type EditorStats = {
 textLength: number;
 version: number;
 wordCount: number;
};

export type BlogSelectionState = EditorStats & {
 activeHighlightColor: string;
 activeTextAlign: BlogTextAlign;
 activeTextColor: string;
 activeTextSize: string;
};

export type EditorToolbarCommands = {
 clearFormatting: () => void;
 insertHorizontalRule: () => void;
 setHighlight: (color: string) => void;
 setParagraph: () => void;
 setTextAlign: (alignment: BlogTextAlign) => void;
 setTextColor: (color: string) => void;
 setTextSize: (size: string) => void;
 toggleBlockquote: () => void;
 toggleBold: () => void;
 toggleBulletList: () => void;
 toggleHeading: (level: 1 | 2 | 3) => void;
 toggleItalic: () => void;
 toggleOrderedList: () => void;
 toggleUnderline: () => void;
 undo: () => void;
 redo: () => void;
 unsetLink: () => void;
};

export type EditorToolbarProps = {
 activeMenuId: string | null;
 className?: string;
 commands: EditorToolbarCommands;
 disabled?: boolean;
 editor: Editor | null;
 error?: boolean;
 selectionState: BlogSelectionState;
 setActiveMenuId: (id: string | null) => void;
 toolbarId: string;
};
