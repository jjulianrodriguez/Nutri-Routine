"use client";

import type { CSSProperties } from "react";

import type { EditorToolbarProps } from "../types";
import { EditorToolbar } from "./EditorToolbar";

type FloatingToolbarProps = Omit<EditorToolbarProps, "className" | "toolbarId"> & {
 floatingStyle: CSSProperties;
 isVisible: boolean;
};

export function FloatingToolbar({
 floatingStyle,
 isVisible,
 ...toolbarProps
}: FloatingToolbarProps) {
 if (!isVisible) {
 return null;
 }

 return (
 <div
 style={floatingStyle}
 className="fixed top-3 z-[160] max-h-[45dvh] overflow-y-auto transition-[left,top,opacity,transform] lg:top-4"
 >
 <EditorToolbar
 {...toolbarProps}
 toolbarId="floating"
 className="rounded-[22px] border border-input "
 />
 </div>
 );
}
