import type { Editor } from "@tiptap/core";

import {
 BLOG_TEXT_ALIGNMENTS,
 type BlogTextAlign,
 type EditorStats,
} from "./types";

export function isBlogTextAlign(value: unknown): value is BlogTextAlign {
 return (
 typeof value === "string" &&
 BLOG_TEXT_ALIGNMENTS.includes(value as BlogTextAlign)
 );
}

function getClassMatch(element: HTMLElement, prefix: string) {
 const className = Array.from(element.classList).find((item) =>
 item.startsWith(prefix),
 );
 return className?.replace(prefix, "") || null;
}

export function parseTextAlign(element: HTMLElement) {
 const classValue = getClassMatch(element, "blog-align-");
 const styleValue = element.style.textAlign;

 if (isBlogTextAlign(classValue)) {
 return classValue;
 }

 return isBlogTextAlign(styleValue) ? styleValue : null;
}

export function isAllowedEditorUrl(value: string) {
 const url = value.trim();

 return (
 /^https?:\/\//i.test(url) ||
 /^mailto:/i.test(url) ||
 /^tel:/i.test(url) ||
 (url.startsWith("/") && !url.startsWith("//")) ||
 url.startsWith("#")
 );
}

export function normalizeEditorUrl(value: string) {
 const url = value.trim();

 if (!url) {
 return "";
 }

 if (isAllowedEditorUrl(url)) {
 return url;
 }

 if (/^[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(url)) {
 return `https://${url}`;
 }

 return "";
}

export function unsetEditorLink(editor: Editor) {
 editor.chain().focus().extendMarkRange("link").unsetLink().run();
}

export function getEditorHtml(editor: Editor) {
 return editor.isEmpty ? "" : editor.getHTML();
}

export function getEditorStats(editor: Editor | null): EditorStats {
 const text = editor?.getText().replace(/\s+/g, " ").trim() ?? "";

 return {
 textLength: text.length,
 version: 0,
 wordCount: text ? text.split(/\s+/).length : 0,
 };
}

export function getActiveTextAlign(editor: Editor | null): BlogTextAlign {
 if (!editor) {
 return "left";
 }

 if (
 editor.isActive("paragraph", { textAlign: "center" }) ||
 editor.isActive("heading", { textAlign: "center" })
 ) {
 return "center";
 }

 if (
 editor.isActive("paragraph", { textAlign: "right" }) ||
 editor.isActive("heading", { textAlign: "right" })
 ) {
 return "right";
 }

 return "left";
}

export function getActiveTextSize(editor: Editor | null): string {
 if (!editor) {
 return "16px";
 }
 return editor.getAttributes("blogTextSize").size || "16px";
}

export function getActiveTextColor(editor: Editor | null): string {
 if (!editor) {
 return "default";
 }
 return editor.getAttributes("blogTextColor").color || "default";
}

export function getActiveHighlightColor(editor: Editor | null): string {
 if (!editor) {
 return "default";
 }
 return editor.getAttributes("blogHighlight").color || "default";
}
