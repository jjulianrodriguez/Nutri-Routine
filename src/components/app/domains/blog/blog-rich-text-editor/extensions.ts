import { Extension, Mark, mergeAttributes } from "@tiptap/core";

import { isBlogTextAlign, parseTextAlign } from "./utils";
import type { BlogTextAlign } from "./types";

declare module "@tiptap/core" {
 interface Commands<ReturnType> {
 blogHighlight: {
 toggleBlogHighlight: () => ReturnType;
 setBlogHighlight: (color: string) => ReturnType;
 unsetBlogHighlight: () => ReturnType;
 };
 blogTextAlign: {
 setBlogTextAlign: (alignment: BlogTextAlign) => ReturnType;
 unsetBlogTextAlign: () => ReturnType;
 };
 blogTextColor: {
 setBlogTextColor: (color: string) => ReturnType;
 unsetBlogTextColor: () => ReturnType;
 };
 blogTextSize: {
 setBlogTextSize: (size: string) => ReturnType;
 unsetBlogTextSize: () => ReturnType;
 };
 }
}

export const BlogTextAlignExtension = Extension.create({
 name: "blogTextAlign",

 addGlobalAttributes() {
 return [
 {
 attributes: {
 textAlign: {
 default: null,
 parseHTML: (element) => parseTextAlign(element as HTMLElement),
 renderHTML: (attributes) => {
 const textAlign = attributes.textAlign;

 return isBlogTextAlign(textAlign)
 ? { class: `blog-align-${textAlign}` }
 : {};
 },
 },
 },
 types: ["heading", "paragraph"],
 },
 ];
 },

 addCommands() {
 return {
 setBlogTextAlign:
 (alignment) =>
 ({ commands }) => {
 if (!isBlogTextAlign(alignment)) {
 return false;
 }

 return ["heading", "paragraph"]
 .map((type) =>
 commands.updateAttributes(type, { textAlign: alignment }),
 )
 .every(Boolean);
 },
 unsetBlogTextAlign:
 () =>
 ({ commands }) =>
 ["heading", "paragraph"]
 .map((type) => commands.updateAttributes(type, { textAlign: null }))
 .every(Boolean),
 };
 },
});

export const BlogTextSizeExtension = Mark.create({
 name: "blogTextSize",

 addAttributes() {
 return {
 size: {
 default: null,
 parseHTML: (element) => {
 const el = element as HTMLElement;
 const styleSize = el.style.fontSize;
 if (styleSize) {
 return styleSize;
 }
 if (el.classList.contains("blog-text-large")) {
 return "20px";
 }
 if (el.classList.contains("blog-text-small")) {
 return "12px";
 }
 return null;
 },
 renderHTML: (attributes) => {
 if (!attributes.size) {
 return {};
 }
 return {
 style: `font-size: ${attributes.size}`,
 };
 },
 },
 };
 },

 parseHTML() {
 return [
 {
 tag: "span",
 getAttrs: (element) => {
 const el = element as HTMLElement;
 const hasFontSize =
 el.style.fontSize ||
 el.classList.contains("blog-text-large") ||
 el.classList.contains("blog-text-small");
 return hasFontSize ? {} : false;
 },
 },
 ];
 },

 renderHTML({ HTMLAttributes }) {
 return ["span", mergeAttributes(HTMLAttributes), 0];
 },

 addCommands() {
 return {
 setBlogTextSize:
 (size) =>
 ({ commands }) => {
 if (!size || size === "16px" || size === "default") {
 return commands.unsetMark(this.name);
 }

 return commands.setMark(this.name, { size });
 },
 unsetBlogTextSize:
 () =>
 ({ commands }) =>
 commands.unsetMark(this.name),
 };
 },
});

export const BlogTextColorExtension = Mark.create({
 name: "blogTextColor",

 addAttributes() {
 return {
 color: {
 default: null,
 parseHTML: (element) => {
 const el = element as HTMLElement;
 const styleColor = el.style.color;
 if (styleColor) {
 return styleColor;
 }
 if (el.classList.contains("blog-color-teal")) {
 return "#3A3A3A";
 }
 if (el.classList.contains("blog-color-accent")) {
 return "#D93A3E";
 }
 if (el.classList.contains("blog-color-charcoal")) {
 return "#292929";
 }
 if (el.classList.contains("blog-color-warm")) {
 return "#5F5F5F";
 }
 return null;
 },
 renderHTML: (attributes) => {
 if (!attributes.color) {
 return {};
 }
 return {
 style: `color: ${attributes.color}`,
 };
 },
 },
 };
 },

 parseHTML() {
 return [
 {
 tag: "span",
 getAttrs: (element) => {
 const el = element as HTMLElement;
 const hasColor =
 el.style.color ||
 el.classList.contains("blog-color-teal") ||
 el.classList.contains("blog-color-accent") ||
 el.classList.contains("blog-color-charcoal") ||
 el.classList.contains("blog-color-warm");
 return hasColor ? {} : false;
 },
 },
 ];
 },

 renderHTML({ HTMLAttributes }) {
 return ["span", mergeAttributes(HTMLAttributes), 0];
 },

 addCommands() {
 return {
 setBlogTextColor:
 (color) =>
 ({ commands }) => {
 if (!color || color === "default") {
 return commands.unsetMark(this.name);
 }

 return commands.setMark(this.name, { color });
 },
 unsetBlogTextColor:
 () =>
 ({ commands }) =>
 commands.unsetMark(this.name),
 };
 },
});

export const BlogHighlightExtension = Mark.create({
 name: "blogHighlight",

 addAttributes() {
 return {
 color: {
 default: null,
 parseHTML: (element) => {
 const el = element as HTMLElement;
 const styleBgColor = el.style.backgroundColor;
 if (styleBgColor) {
 return styleBgColor;
 }
 return null;
 },
 renderHTML: (attributes) => {
 if (!attributes.color) {
 return {};
 }
 return {
 style: `background-color: ${attributes.color}`,
 };
 },
 },
 };
 },

 parseHTML() {
 return [
 {
 tag: "span",
 getAttrs: (element) => {
 const el = element as HTMLElement;
 const hasHighlight =
 el.classList.contains("blog-highlight") ||
 el.style.backgroundColor;
 return hasHighlight ? {} : false;
 },
 },
 ];
 },

 renderHTML({ HTMLAttributes }) {
 return [
 "span",
 mergeAttributes(HTMLAttributes, { class: "blog-highlight" }),
 0,
 ];
 },

 addCommands() {
 return {
 setBlogHighlight:
 (color) =>
 ({ commands }) => {
 if (!color || color === "default") {
 return commands.unsetMark(this.name);
 }
 return commands.setMark(this.name, { color });
 },
 unsetBlogHighlight:
 () =>
 ({ commands }) =>
 commands.unsetMark(this.name),
 toggleBlogHighlight:
 () =>
 ({ commands }) =>
 commands.toggleMark(this.name),
 };
 },
});