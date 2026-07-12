"use client";

import { useCallback, useMemo } from "react";
import type { Editor } from "@tiptap/core";

import type { BlogTextAlign, EditorToolbarCommands } from "../types";
import { unsetEditorLink } from "../utils";

export function useEditorCommands(
 editor: Editor | null,
 setActiveMenuId: (id: string | null) => void,
): EditorToolbarCommands {
 const runToolbarAction = useCallback(
 (action: () => void) => {
 setActiveMenuId(null);
 action();
 },
 [setActiveMenuId],
 );

 return useMemo(
 () => ({
 clearFormatting: () =>
 runToolbarAction(() =>
 editor?.chain().focus().unsetAllMarks().unsetBlogTextAlign().clearNodes().run(),
 ),
 insertHorizontalRule: () =>
 runToolbarAction(() => editor?.chain().focus().setHorizontalRule().run()),
 setHighlight: (color: string) =>
 editor?.chain().focus().setBlogHighlight(color).run(),
 setParagraph: () =>
 runToolbarAction(() => editor?.chain().focus().setParagraph().run()),
 setTextAlign: (alignment: BlogTextAlign) =>
 runToolbarAction(() =>
 editor?.chain().focus().setBlogTextAlign(alignment).run(),
 ),
 setTextColor: (color: string) =>
 editor?.chain().focus().setBlogTextColor(color).run(),
 setTextSize: (size: string) =>
 editor?.chain().focus().setBlogTextSize(size).run(),
 toggleBlockquote: () =>
 runToolbarAction(() => editor?.chain().focus().toggleBlockquote().run()),
 toggleBold: () =>
 runToolbarAction(() => editor?.chain().focus().toggleBold().run()),
 toggleBulletList: () =>
 runToolbarAction(() => editor?.chain().focus().toggleBulletList().run()),
 toggleHeading: (level: 1 | 2 | 3) =>
 runToolbarAction(() =>
 editor?.chain().focus().toggleHeading({ level }).run(),
 ),
 toggleItalic: () =>
 runToolbarAction(() => editor?.chain().focus().toggleItalic().run()),
 toggleOrderedList: () =>
 runToolbarAction(() => editor?.chain().focus().toggleOrderedList().run()),
 toggleUnderline: () =>
 runToolbarAction(() => editor?.chain().focus().toggleUnderline().run()),
 undo: () =>
 runToolbarAction(() => editor?.chain().focus().undo().run()),
 redo: () =>
 runToolbarAction(() => editor?.chain().focus().redo().run()),
 unsetLink: () =>
 runToolbarAction(() => {
 if (editor) {
 unsetEditorLink(editor);
 }
 }),
 }),
 [editor, runToolbarAction],
 );
}