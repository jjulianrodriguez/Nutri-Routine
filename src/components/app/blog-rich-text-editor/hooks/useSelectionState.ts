"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/core";

import type { BlogSelectionState } from "../types";
import {
 getActiveHighlightColor,
 getActiveTextAlign,
 getActiveTextColor,
 getActiveTextSize,
 getEditorStats,
} from "../utils";

function getSelectionState(editor: Editor | null, version = 0): BlogSelectionState {
 const stats = getEditorStats(editor);

 return {
 ...stats,
 activeHighlightColor: getActiveHighlightColor(editor),
 activeTextAlign: getActiveTextAlign(editor),
 activeTextColor: getActiveTextColor(editor),
 activeTextSize: getActiveTextSize(editor),
 version,
 };
}

export function useSelectionState(editor: Editor | null, value: string) {
 const [selectionState, setSelectionState] = useState<BlogSelectionState>(() =>
 getSelectionState(null),
 );

 useEffect(() => {
 if (!editor) {
 return;
 }

 const refreshToolbarState = () => {
 setSelectionState((current) =>
 getSelectionState(editor, current.version + 1),
 );
 };

 refreshToolbarState();
 editor.on("selectionUpdate", refreshToolbarState);
 editor.on("transaction", refreshToolbarState);

 return () => {
 editor.off("selectionUpdate", refreshToolbarState);
 editor.off("transaction", refreshToolbarState);
 };
 }, [editor]);

 useEffect(() => {
 if (!editor) {
 return;
 }

 const statsTimer = window.setTimeout(() => {
 setSelectionState((current) =>
 getSelectionState(editor, current.version + 1),
 );
 }, 0);

 return () => window.clearTimeout(statsTimer);
 }, [editor, value]);

 return selectionState;
}
