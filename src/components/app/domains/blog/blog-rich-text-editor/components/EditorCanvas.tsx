"use client";

import type { Editor } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";

import { cn } from "@/lib/utils";

import { editorContentClasses } from "../styles";

export function EditorCanvas({
 editor,
 error,
 isEmpty,
}: {
 editor: Editor | null;
 error: boolean;
 isEmpty: boolean;
}) {
 return (
 <div
 className={cn(
 editorContentClasses,
 "min-h-full !bg-surface !shadow-none [&_.ProseMirror]:min-h-full",
 error && "border-danger/40",
 )}
 >
 <EditorContent className="!bg-surface !shadow-none" editor={editor} />
 {isEmpty ? (
 <span className="pointer-events-none absolute inset-x-6 top-8 text-base leading-7 text-muted sm:inset-x-10 sm:top-10">
 Empieza a escribir tu publicación…
 </span>
 ) : null}
 </div>
 );
}
