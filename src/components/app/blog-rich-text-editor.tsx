"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { Extension, Mark, mergeAttributes, type Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Minus,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  Type,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, forwardRef } from "react";
import { toast } from "sonner";

import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type BlogRichTextEditorProps = {
  describedBy?: string;
  disabled?: boolean;
  error?: boolean;
  id: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  value: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

const BLOG_TEXT_ALIGNMENTS = ["left", "center", "right"] as const;

type BlogTextAlign = (typeof BLOG_TEXT_ALIGNMENTS)[number];

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

function isBlogTextAlign(value: unknown): value is BlogTextAlign {
  return (
    typeof value === "string" &&
    BLOG_TEXT_ALIGNMENTS.includes(value as BlogTextAlign)
  );
}

function getClassMatch(
  element: HTMLElement,
  prefix: string,
) {
  const className = Array.from(element.classList).find((item) =>
    item.startsWith(prefix),
  );
  return className?.replace(prefix, "") || null;
}

function parseTextAlign(element: HTMLElement) {
  const classValue = getClassMatch(
    element,
    "blog-align-",
  );
  const styleValue = element.style.textAlign;

  if (isBlogTextAlign(classValue)) {
    return classValue;
  }

  return isBlogTextAlign(styleValue) ? styleValue : null;
}

const BlogTextAlignExtension = Extension.create({
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

const BlogTextSizeExtension = Mark.create({
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

const BlogTextColorExtension = Mark.create({
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
            return "#44509F";
          }
          if (el.classList.contains("blog-color-accent")) {
            return "#F87F52";
          }
          if (el.classList.contains("blog-color-charcoal")) {
            return "#071C33";
          }
          if (el.classList.contains("blog-color-warm")) {
            return "#DB3854";
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

const BlogHighlightExtension = Mark.create({
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

function isAllowedEditorUrl(value: string) {
  const url = value.trim();

  return (
    /^https?:\/\//i.test(url) ||
    /^mailto:/i.test(url) ||
    /^tel:/i.test(url) ||
    (url.startsWith("/") && !url.startsWith("//")) ||
    url.startsWith("#")
  );
}

function normalizeEditorUrl(value: string) {
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

function ToolbarButton({
  active = false,
  disabled = false,
  icon: Icon,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          title={label}
          onMouseDown={(event) => {
            event.preventDefault();
            onClick();
          }}
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] border text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-45",
            active
              ? "border-teal/35 bg-primary text-charcoal shadow-soft"
              : "border-border bg-surface text-muted hover:border-primary/40 hover:bg-primary-soft hover:text-charcoal",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function SizeDropdown({
  disabled = false,
  value,
  onChange,
}: {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => setIsOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  const sizes = [
    { label: "10px", value: "10px" },
    { label: "12px", value: "12px" },
    { label: "14px", value: "14px" },
    { label: "16px (Normal)", value: "16px" },
    { label: "18px", value: "18px" },
    { label: "20px", value: "20px" },
    { label: "22px", value: "22px" },
    { label: "24px", value: "24px" },
    { label: "28px", value: "28px" },
    { label: "32px", value: "32px" },
    { label: "36px", value: "36px" },
    { label: "40px", value: "40px" },
    { label: "48px", value: "48px" },
    { label: "56px", value: "56px" },
    { label: "64px", value: "64px" },
  ];

  const currentLabel = sizes.find((s) => s.value === value)?.label || value || "16px (Normal)";

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "inline-flex h-10 items-center justify-between gap-1.5 rounded-[14px] border border-border bg-surface px-3 text-xs font-bold text-charcoal shadow-sm transition-all focus:outline-none focus:ring-3 focus:ring-ring/25 hover:border-primary/40 hover:bg-primary-soft",
          disabled && "pointer-events-none opacity-45"
        )}
      >
        <Type className="size-4 text-muted" />
        <span>{currentLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 max-h-60 w-32 overflow-y-auto rounded-[14px] border border-border bg-surface p-1 shadow-premium">
          {sizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => {
                onChange(size.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors hover:bg-primary-soft hover:text-charcoal",
                value === size.value || (size.value === "16px" && !value)
                  ? "bg-primary-soft text-teal"
                  : "text-muted"
              )}
            >
              {size.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorDropdown({
  disabled = false,
  value,
  onChange,
}: {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value && value !== "default" ? value : "");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHexInput(value && value !== "default" ? value : "");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => setIsOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  const presetColors = [
    { label: "Auto", value: "default", class: "" },
    { label: "Amarantha", value: "#DB3854", class: "bg-[#DB3854]" },
    { label: "Basketball", value: "#F87F52", class: "bg-[#F87F52]" },
    { label: "Lu Lee", value: "#44509F", class: "bg-[#44509F]" },
    { label: "Navy", value: "#071C33", class: "bg-[#071C33]" },
    { label: "Charcoal", value: "#535353", class: "bg-[#535353]" },
    { label: "Muted", value: "#656B78", class: "bg-[#656B78]" },
  ];

  const currentSwatchStyle = value && value !== "default" ? { backgroundColor: value } : undefined;

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-[14px] border border-border bg-surface px-3 text-xs font-bold text-charcoal shadow-sm transition-all focus:outline-none focus:ring-3 focus:ring-ring/25 hover:border-primary/40 hover:bg-primary-soft",
          disabled && "pointer-events-none opacity-45"
        )}
      >
        <Palette className="size-4 text-muted" />
        {currentSwatchStyle ? (
          <span
            className="size-3.5 rounded-full border border-charcoal/10"
            style={currentSwatchStyle}
          />
        ) : (
          <span className="text-[10px] font-extrabold text-muted">Auto</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 w-52 rounded-[18px] border border-border bg-surface p-3 shadow-premium">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
            Paleta de colores
          </p>
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.label}
                onClick={() => {
                  onChange(color.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "relative flex size-6 shrink-0 items-center justify-center rounded-full border border-border transition-transform active:scale-95 hover:scale-110",
                  value === color.value || (color.value === "default" && (!value || value === "default"))
                    ? "ring-2 ring-teal ring-offset-1"
                    : ""
                )}
              >
                {color.value === "default" ? (
                  <span className="text-[9px] font-bold text-charcoal">A</span>
                ) : (
                  <span className={cn("size-full rounded-full", color.class)} />
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
              Color personalizado
            </p>
            <div className="flex items-center gap-2">
              <label className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-border bg-background transition-colors hover:bg-surface-hover">
                <input
                  type="color"
                  value={value && value !== "default" && value.startsWith("#") ? value : "#44509F"}
                  onChange={(e) => {
                    onChange(e.target.value);
                  }}
                  className="sr-only"
                />
                <span
                  className="size-5 rounded-[4px] border border-charcoal/10"
                  style={{ backgroundColor: value && value !== "default" ? value : "#44509F" }}
                />
              </label>
              <input
                type="text"
                placeholder="#HEX"
                value={hexInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setHexInput(val);
                  if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
                    onChange(val);
                  }
                }}
                className="h-8 w-full rounded-[8px] border border-border bg-background px-2 text-xs font-bold uppercase text-charcoal outline-none focus:border-primary/40 focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HighlightDropdown({
  disabled = false,
  value,
  onChange,
}: {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value && value !== "default" ? value : "");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHexInput(value && value !== "default" ? value : "");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => setIsOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpen]);

  const presetColors = [
    { label: "Sin resaltado", value: "default", class: "" },
    { label: "Banana Light", value: "#FFE9AD", class: "bg-[#FFE9AD]" },
    { label: "Almost Dawn", value: "#FFF8E8", class: "bg-[#FFF8E8]" },
    { label: "Amarantha suave", value: "#F8CAD2", class: "bg-[#F8CAD2]" },
    { label: "Basketball suave", value: "#FFE0D2", class: "bg-[#FFE0D2]" },
    { label: "Lu Lee suave", value: "#DDE1FF", class: "bg-[#DDE1FF]" },
    { label: "Neutro", value: "#E9ECEF", class: "bg-[#E9ECEF]" },
  ];

  const currentSwatchStyle = value && value !== "default" ? { backgroundColor: value } : undefined;

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-[14px] border border-border bg-surface px-3 text-xs font-bold text-charcoal shadow-sm transition-all focus:outline-none focus:ring-3 focus:ring-ring/25 hover:border-primary/40 hover:bg-primary-soft",
          disabled && "pointer-events-none opacity-45"
        )}
      >
        <Highlighter className="size-4 text-muted" />
        {currentSwatchStyle ? (
          <span
            className="size-3.5 rounded-full border border-charcoal/10"
            style={currentSwatchStyle}
          />
        ) : (
          <span className="text-[10px] font-extrabold text-muted">Ninguno</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 w-52 rounded-[18px] border border-border bg-surface p-3 shadow-premium">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
            Color de resaltado
          </p>
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.label}
                onClick={() => {
                  onChange(color.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "relative flex size-6 shrink-0 items-center justify-center rounded-full border border-border transition-transform active:scale-95 hover:scale-110",
                  value === color.value || (color.value === "default" && (!value || value === "default"))
                    ? "ring-2 ring-teal ring-offset-1"
                    : ""
                )}
              >
                {color.value === "default" ? (
                  <span className="text-[9px] font-bold text-charcoal">✕</span>
                ) : (
                  <span className={cn("size-full rounded-full", color.class)} />
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
              Resaltado personalizado
            </p>
            <div className="flex items-center gap-2">
              <label className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-border bg-background transition-colors hover:bg-surface-hover">
                <input
                  type="color"
                  value={value && value !== "default" && value.startsWith("#") ? value : "#FFE9AD"}
                  onChange={(e) => {
                    onChange(e.target.value);
                  }}
                  className="sr-only"
                />
                <span
                  className="size-5 rounded-[4px] border border-charcoal/10"
                  style={{ backgroundColor: value && value !== "default" ? value : "#FFE9AD" }}
                />
              </label>
              <input
                type="text"
                placeholder="#HEX"
                value={hexInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setHexInput(val);
                  if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
                    onChange(val);
                  }
                }}
                className="h-8 w-full rounded-[8px] border border-border bg-background px-2 text-xs font-bold uppercase text-charcoal outline-none focus:border-primary/40 focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 hidden h-8 w-px bg-border sm:block" />;
}

function setEditorLink(editor: Editor) {
  const currentHref = String(editor.getAttributes("link").href ?? "");
  const input = window.prompt("URL del enlace", currentHref || "https://");

  if (input === null) {
    return;
  }

  const href = normalizeEditorUrl(input);

  if (!href) {
    toast.error("Usa una URL http(s), mailto:, tel: o una ruta interna.");
    return;
  }

  editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
}

function unsetEditorLink(editor: Editor) {
  editor.chain().focus().extendMarkRange("link").unsetLink().run();
}

function getEditorHtml(editor: Editor) {
  return editor.isEmpty ? "" : editor.getHTML();
}

function getEditorStats(editor: Editor | null) {
  const text = editor?.getText().replace(/\s+/g, " ").trim() ?? "";

  return {
    textLength: text.length,
    wordCount: text ? text.split(/\s+/).length : 0,
  };
}

function getActiveTextAlign(editor: Editor | null): BlogTextAlign {
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

function getActiveTextSize(editor: Editor | null): string {
  if (!editor) {
    return "16px";
  }
  return editor.getAttributes("blogTextSize").size || "16px";
}

function getActiveTextColor(editor: Editor | null): string {
  if (!editor) {
    return "default";
  }
  return editor.getAttributes("blogTextColor").color || "default";
}

function getActiveHighlightColor(editor: Editor | null): string {
  if (!editor) {
    return "default";
  }
  return editor.getAttributes("blogHighlight").color || "default";
}

const editorContentClasses = [
  "relative overflow-hidden rounded-b-[22px] border-x border-b border-input bg-surface/90 shadow-soft",
  "[&_.ProseMirror]:min-h-[20rem] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-4 [&_.ProseMirror]:text-base [&_.ProseMirror]:leading-7 [&_.ProseMirror]:text-foreground [&_.ProseMirror]:outline-none sm:[&_.ProseMirror]:px-5",
  "[&_.ProseMirror_a]:font-bold [&_.ProseMirror_a]:text-teal [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-4",
  "[&_.ProseMirror_.blog-align-center]:text-center [&_.ProseMirror_.blog-align-left]:text-left [&_.ProseMirror_.blog-align-right]:text-right",
  "[&_.ProseMirror_.blog-color-accent]:text-lavender-dark [&_.ProseMirror_.blog-color-charcoal]:text-charcoal [&_.ProseMirror_.blog-color-teal]:text-teal [&_.ProseMirror_.blog-color-warm]:text-warm-brown",
  "[&_.ProseMirror_.blog-highlight]:rounded-[8px] [&_.ProseMirror_.blog-highlight]:bg-accent-soft [&_.ProseMirror_.blog-highlight]:px-1.5 [&_.ProseMirror_.blog-highlight]:py-0.5 [&_.ProseMirror_.blog-highlight]:font-semibold [&_.ProseMirror_.blog-highlight]:text-charcoal",
  "[&_.ProseMirror_.blog-text-large]:text-xl [&_.ProseMirror_.blog-text-large]:leading-9 [&_.ProseMirror_.blog-text-small]:text-sm [&_.ProseMirror_.blog-text-small]:leading-6",
  "[&_.ProseMirror_blockquote]:my-5 [&_.ProseMirror_blockquote]:rounded-[18px] [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-sage [&_.ProseMirror_blockquote]:bg-primary-soft [&_.ProseMirror_blockquote]:px-4 [&_.ProseMirror_blockquote]:py-3 [&_.ProseMirror_blockquote]:font-semibold [&_.ProseMirror_blockquote]:text-charcoal",
  "[&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:mt-8 [&_.ProseMirror_h1]:font-serif [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:leading-tight [&_.ProseMirror_h1]:text-charcoal",
  "[&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-7 [&_.ProseMirror_h2]:font-serif [&_.ProseMirror_h2]:text-3xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:leading-tight [&_.ProseMirror_h2]:text-charcoal",
  "[&_.ProseMirror_h3]:mb-3 [&_.ProseMirror_h3]:mt-6 [&_.ProseMirror_h3]:font-serif [&_.ProseMirror_h3]:text-2xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:leading-tight [&_.ProseMirror_h3]:text-charcoal",
  "[&_.ProseMirror_hr]:my-8 [&_.ProseMirror_hr]:border-0 [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-border",
  "[&_.ProseMirror_li]:my-1.5 [&_.ProseMirror_li]:pl-1 [&_.ProseMirror_ol]:my-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:my-4 [&_.ProseMirror_u]:underline [&_.ProseMirror_ul]:my-5 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6",
  "[&_.ProseMirror>*:first-child]:mt-0 [&_.ProseMirror>*:last-child]:mb-0",
].join(" ");

interface BlogEditorToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export const BlogEditorToolbar = forwardRef<HTMLDivElement, BlogEditorToolbarProps>(
  ({ editor, disabled = false, className, error = false }, ref) => {
    const toolbarDisabled = disabled || !editor;
    const activeTextAlign = getActiveTextAlign(editor);
    const activeTextColor = getActiveTextColor(editor);
    const activeHighlightColor = getActiveHighlightColor(editor);
    const activeTextSize = getActiveTextSize(editor);

    return (
      <TooltipProvider>
        <div
          ref={ref}
          className={cn(
            "flex flex-wrap items-center gap-1.5 p-2 bg-background/95 backdrop-blur-md",
            error && "border-danger/40",
            className
          )}
          aria-label="Herramientas de formato del blog"
          role="toolbar"
        >
          <ToolbarButton
            active={editor?.isActive("bold")}
            disabled={toolbarDisabled}
            icon={Bold}
            label="Negrita"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            active={editor?.isActive("italic")}
            disabled={toolbarDisabled}
            icon={Italic}
            label="Cursiva"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            active={editor?.isActive("underline")}
            disabled={toolbarDisabled}
            icon={Underline}
            label="Subrayado"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <HighlightDropdown
            disabled={toolbarDisabled}
            value={activeHighlightColor}
            onChange={(color) => {
              editor?.chain().focus().setBlogHighlight(color).run();
            }}
          />
          <SizeDropdown
            disabled={toolbarDisabled}
            value={activeTextSize}
            onChange={(nextSize) => {
              editor?.chain().focus().setBlogTextSize(nextSize).run();
            }}
          />
          <ColorDropdown
            disabled={toolbarDisabled}
            value={activeTextColor}
            onChange={(color) => {
              editor?.chain().focus().setBlogTextColor(color).run();
            }}
          />

          <ToolbarDivider />

          <ToolbarButton
            active={editor?.isActive("paragraph")}
            disabled={toolbarDisabled}
            icon={Pilcrow}
            label="Parrafo"
            onClick={() => editor?.chain().focus().setParagraph().run()}
          />
          <ToolbarButton
            active={editor?.isActive("heading", { level: 1 })}
            disabled={toolbarDisabled}
            icon={Heading1}
            label="Titulo H1"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
          />
          <ToolbarButton
            active={editor?.isActive("heading", { level: 2 })}
            disabled={toolbarDisabled}
            icon={Heading2}
            label="Titulo H2"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <ToolbarButton
            active={editor?.isActive("heading", { level: 3 })}
            disabled={toolbarDisabled}
            icon={Heading3}
            label="Titulo H3"
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
          />

          <ToolbarButton
            active={activeTextAlign === "left"}
            disabled={toolbarDisabled}
            icon={AlignLeft}
            label="Alinear izquierda"
            onClick={() =>
              editor?.chain().focus().setBlogTextAlign("left").run()
            }
          />
          <ToolbarButton
            active={activeTextAlign === "center"}
            disabled={toolbarDisabled}
            icon={AlignCenter}
            label="Alinear centro"
            onClick={() =>
              editor?.chain().focus().setBlogTextAlign("center").run()
            }
          />
          <ToolbarButton
            active={activeTextAlign === "right"}
            disabled={toolbarDisabled}
            icon={AlignRight}
            label="Alinear derecha"
            onClick={() =>
              editor?.chain().focus().setBlogTextAlign("right").run()
            }
          />

          <ToolbarDivider />

          <ToolbarButton
            active={editor?.isActive("bulletList")}
            disabled={toolbarDisabled}
            icon={List}
            label="Lista con vinetas"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            active={editor?.isActive("orderedList")}
            disabled={toolbarDisabled}
            icon={ListOrdered}
            label="Lista numerada"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            active={editor?.isActive("blockquote")}
            disabled={toolbarDisabled}
            icon={Quote}
            label="Cita"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            disabled={toolbarDisabled}
            icon={Minus}
            label="Separador"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          />

          <ToolbarDivider />

          <ToolbarButton
            active={editor?.isActive("link")}
            disabled={toolbarDisabled}
            icon={LinkIcon}
            label="Agregar enlace"
            onClick={() => {
              if (editor) {
                setEditorLink(editor);
              }
            }}
          />
          <ToolbarButton
            disabled={toolbarDisabled || !editor?.isActive("link")}
            icon={Unlink}
            label="Quitar enlace"
            onClick={() => {
              if (editor) {
                unsetEditorLink(editor);
              }
            }}
          />
          <ToolbarButton
            disabled={toolbarDisabled}
            icon={Eraser}
            label="Limpiar formato"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .unsetAllMarks()
                .unsetBlogTextAlign()
                .clearNodes()
                .run()
            }
          />

          <ToolbarDivider />

          <ToolbarButton
            disabled={toolbarDisabled || !editor?.can().undo()}
            icon={Undo2}
            label="Deshacer"
            onClick={() => editor?.chain().focus().undo().run()}
          />
          <ToolbarButton
            disabled={toolbarDisabled || !editor?.can().redo()}
            icon={Redo2}
            label="Rehacer"
            onClick={() => editor?.chain().focus().redo().run()}
          />
        </div>
      </TooltipProvider>
    );
  }
);

BlogEditorToolbar.displayName = "BlogEditorToolbar";

export function BlogRichTextEditor({
  describedBy,
  disabled = false,
  error = false,
  id,
  onBlur,
  onChange,
  value,
}: BlogRichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [toolbarState, setToolbarState] = useState({
    textLength: 0,
    version: 0,
    wordCount: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const mainToolbarRef = useRef<HTMLDivElement>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [floatingStyle, setFloatingStyle] = useState<React.CSSProperties>({});
  const isEmpty = !value.trim();
  const editor = useEditor({
    editable: !disabled,
    editorProps: {
      attributes: {
        "aria-describedby": describedBy ?? "",
        "aria-invalid": error ? "true" : "false",
        "aria-label": "Contenido del blog",
        "aria-multiline": "true",
        class:
          "min-h-[20rem] px-4 py-4 text-base leading-7 text-foreground outline-none sm:px-5",
        id,
        role: "textbox",
      },
    },
    extensions: [
      BlogTextAlignExtension,
      BlogTextColorExtension,
      BlogTextSizeExtension,
      BlogHighlightExtension,
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
          autolink: true,
          defaultProtocol: "https",
          isAllowedUri: (url, context) =>
            !url.trim().startsWith("//") &&
            (isAllowedEditorUrl(url) || context.defaultValidate(url)),
          openOnClick: false,
          protocols: ["http", "https", "mailto", "tel"],
        },
        strike: false,
      }),
      Placeholder.configure({
        placeholder: "Escribe el contenido del blog...",
      }),
    ],
    immediatelyRender: false,
    onBlur: () => {
      onBlur?.();
    },
    onUpdate: ({ editor: currentEditor }) => {
      const stats = getEditorStats(currentEditor);

      setToolbarState((current) => ({
        ...stats,
        version: current.version + 1,
      }));
      onChange(getEditorHtml(currentEditor));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const refreshToolbarState = () => {
      const stats = getEditorStats(editor);

      setToolbarState((current) => ({
        ...stats,
        version: current.version + 1,
      }));
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

    const currentHtml = getEditorHtml(editor);

    if (value !== currentHtml) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }

    const statsTimer = window.setTimeout(() => {
      setToolbarState((current) => ({
        ...getEditorStats(editor),
        version: current.version + 1,
      }));
    }, 0);

    return () => window.clearTimeout(statsTimer);
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    const mainToolbar = mainToolbarRef.current;
    const container = containerRef.current;
    if (!mainToolbar || !container) return;

    let isMainToolbarIntersecting = true;
    let isContainerIntersecting = false;

    const updateVisibility = () => {
      setShowFloatingToolbar(isContainerIntersecting && !isMainToolbarIntersecting);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === mainToolbar) {
            isMainToolbarIntersecting = entry.isIntersecting;
          }
          if (entry.target === container) {
            isContainerIntersecting = entry.isIntersecting;
          }
        });
        updateVisibility();
      },
      {
        threshold: 0,
        rootMargin: "-64px 0px 0px 0px",
      }
    );

    observer.observe(mainToolbar);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showFloatingToolbar) return;

    const updatePosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setFloatingStyle({
        width: `${rect.width}px`,
        left: `${rect.left}px`,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showFloatingToolbar]);

  const contentLength = value.trim().length;
  const isNearContentLimit = contentLength >= 45000;

  return (
    <div ref={containerRef}>
      <BlogEditorToolbar
        ref={mainToolbarRef}
        editor={editor}
        disabled={disabled}
        error={error}
        className="rounded-t-[22px] border border-input shadow-soft"
      />

      {showFloatingToolbar && (
        <div
          style={floatingStyle}
          className="fixed top-16 lg:top-0 z-40 rounded-b-[22px] border-x border-b border-input bg-background/95 shadow-premium backdrop-blur-md transition-all overflow-hidden"
        >
          <BlogEditorToolbar
            editor={editor}
            disabled={disabled}
            error={error}
          />
        </div>
      )}

      <div className={cn(editorContentClasses, error && "border-danger/40")}>
        <EditorContent editor={editor} />
        {isEmpty ? (
          <span className="pointer-events-none absolute left-4 top-4 text-base leading-7 text-muted sm:left-5">
            Escribe el contenido del blog...
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold leading-5 text-muted">
          <p>
            Formato permitido: titulos, listas, enlaces seguros, citas,
            alineacion, color de paleta y resaltado.
          </p>
          <p
            className={cn(
              "mt-1",
              isNearContentLimit && "font-extrabold text-danger",
            )}
          >
            {toolbarState.wordCount} palabras / {toolbarState.textLength}{" "}
            caracteres de texto / {contentLength.toLocaleString("es-CR")} de
            50 000 caracteres guardables.
          </p>
        </div>
        <Button
          type="button"
          variant={showPreview ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowPreview((current) => !current)}
        >
          {showPreview ? "Ocultar vista previa" : "Vista previa"}
        </Button>
      </div>

      {showPreview ? (
        <div className="mt-4 rounded-[22px] border border-border bg-background p-4 sm:p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
            Vista previa
          </p>
          <BlogContentRenderer
            className="mt-4"
            content={value}
            emptyMessage="La vista previa aparecerá cuando escribas contenido."
            variant="preview"
          />
        </div>
      ) : null}
    </div>
  );
}
