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
 <span className="pointer-events-none absolute left-1/2 top-8 w-[calc(100%-3rem)] max-w-3xl -translate-x-1/2 text-base leading-7 text-muted sm:top-10">
 Empieza a escribir tu publicación…
 </span>
 ) : null}
 </div>
 );
}
