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
 <div className={cn(editorContentClasses, error && "border-danger/40")}>
 <EditorContent editor={editor} />
 {isEmpty ? (
 <span className="pointer-events-none absolute left-4 top-4 text-base leading-7 text-muted sm:left-5">
 Escribe el contenido del blog...
 </span>
 ) : null}
 </div>
 );
}
