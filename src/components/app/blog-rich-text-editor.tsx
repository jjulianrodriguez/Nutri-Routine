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
import { useEffect, useState } from "react";
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
const BLOG_TEXT_SIZES = ["small", "normal", "large"] as const;
const BLOG_TEXT_COLORS = [
  {
    className: "blog-color-charcoal",
    label: "Azul oscuro",
    swatchClassName: "bg-charcoal",
    value: "charcoal",
  },
  {
    className: "blog-color-warm",
    label: "Azul medio",
    swatchClassName: "bg-warm-brown",
    value: "warm",
  },
  {
    className: "blog-color-teal",
    label: "Teal",
    swatchClassName: "bg-teal",
    value: "teal",
  },
  {
    className: "blog-color-accent",
    label: "Acento",
    swatchClassName: "bg-accent",
    value: "accent",
  },
] as const;

type BlogTextAlign = (typeof BLOG_TEXT_ALIGNMENTS)[number];
type BlogTextSize = (typeof BLOG_TEXT_SIZES)[number];
type BlogTextColor = (typeof BLOG_TEXT_COLORS)[number]["value"];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blogHighlight: {
      toggleBlogHighlight: () => ReturnType;
    };
    blogTextAlign: {
      setBlogTextAlign: (alignment: BlogTextAlign) => ReturnType;
      unsetBlogTextAlign: () => ReturnType;
    };
    blogTextColor: {
      setBlogTextColor: (color: BlogTextColor) => ReturnType;
      unsetBlogTextColor: () => ReturnType;
    };
    blogTextSize: {
      setBlogTextSize: (size: BlogTextSize) => ReturnType;
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

function isBlogTextSize(value: unknown): value is BlogTextSize {
  return (
    typeof value === "string" &&
    BLOG_TEXT_SIZES.includes(value as BlogTextSize)
  );
}

function getBlogTextColor(value: unknown): BlogTextColor | null {
  if (typeof value !== "string") {
    return null;
  }

  return BLOG_TEXT_COLORS.some((color) => color.value === value)
    ? (value as BlogTextColor)
    : null;
}

function getClassMatch(
  element: HTMLElement,
  prefix: string,
  values: readonly string[],
) {
  const className = Array.from(element.classList).find((item) =>
    item.startsWith(prefix),
  );
  const value = className?.replace(prefix, "");

  return value && values.includes(value) ? value : null;
}

function parseTextAlign(element: HTMLElement) {
  const classValue = getClassMatch(
    element,
    "blog-align-",
    BLOG_TEXT_ALIGNMENTS,
  );
  const styleValue = element.style.textAlign;

  if (isBlogTextAlign(classValue)) {
    return classValue;
  }

  return isBlogTextAlign(styleValue) ? styleValue : null;
}

function parseTextSize(element: HTMLElement) {
  const classValue = getClassMatch(element, "blog-text-", [
    "large",
    "small",
  ]);

  return isBlogTextSize(classValue) ? classValue : null;
}

function parseTextColor(element: HTMLElement) {
  const classValue = getClassMatch(
    element,
    "blog-color-",
    BLOG_TEXT_COLORS.map((color) => color.value),
  );

  return getBlogTextColor(classValue);
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
        parseHTML: (element) => parseTextSize(element as HTMLElement),
        renderHTML: (attributes) => {
          const size = attributes.size;

          return size === "small" || size === "large"
            ? { class: `blog-text-${size}` }
            : {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span.blog-text-large",
      },
      {
        tag: "span.blog-text-small",
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
          if (size === "normal") {
            return commands.unsetMark(this.name);
          }

          return isBlogTextSize(size)
            ? commands.setMark(this.name, { size })
            : false;
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
        parseHTML: (element) => parseTextColor(element as HTMLElement),
        renderHTML: (attributes) => {
          const color = getBlogTextColor(attributes.color);

          return color ? { class: `blog-color-${color}` } : {};
        },
      },
    };
  },

  parseHTML() {
    return BLOG_TEXT_COLORS.map((color) => ({
      tag: `span.${color.className}`,
    }));
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setBlogTextColor:
        (color) =>
        ({ commands }) => {
          const safeColor = getBlogTextColor(color);

          return safeColor
            ? commands.setMark(this.name, { color: safeColor })
            : false;
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

  parseHTML() {
    return [
      {
        tag: "span.blog-highlight",
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

function ToolbarSelect({
  disabled = false,
  icon: Icon,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[14px] border border-border bg-surface px-2 text-muted transition-colors focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-ring/25 hover:border-primary/40 hover:bg-primary-soft hover:text-charcoal",
        disabled && "pointer-events-none opacity-45",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full min-h-0 min-w-[6.75rem] bg-transparent text-xs font-extrabold text-charcoal outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ColorSwatchButton({
  active = false,
  disabled = false,
  label,
  onClick,
  swatchClassName,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  swatchClassName?: string;
}) {
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
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full border bg-surface transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-45",
            active
              ? "border-teal bg-primary-soft shadow-soft"
              : "border-border hover:border-primary/40 hover:bg-primary-soft",
          )}
        >
          {swatchClassName ? (
            <span
              className={cn(
                "size-4 rounded-full border border-charcoal/10",
                swatchClassName,
              )}
              aria-hidden="true"
            />
          ) : (
            <span className="text-[10px] font-extrabold text-charcoal">
              Auto
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
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

function getActiveTextSize(editor: Editor | null): BlogTextSize {
  if (editor?.isActive("blogTextSize", { size: "small" })) {
    return "small";
  }

  if (editor?.isActive("blogTextSize", { size: "large" })) {
    return "large";
  }

  return "normal";
}

function getActiveTextColor(editor: Editor | null): BlogTextColor | "default" {
  if (!editor) {
    return "default";
  }

  return (
    BLOG_TEXT_COLORS.find((color) =>
      editor.isActive("blogTextColor", { color: color.value }),
    )?.value ?? "default"
  );
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

  const toolbarDisabled = disabled || !editor;
  const activeTextAlign = getActiveTextAlign(editor);
  const activeTextColor = getActiveTextColor(editor);
  const activeTextSize = getActiveTextSize(editor);
  const contentLength = value.trim().length;
  const isNearContentLimit = contentLength >= 45000;

  return (
    <div>
      <TooltipProvider>
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5 rounded-t-[22px] border border-input bg-background/90 p-2 shadow-soft",
            error && "border-danger/40",
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
          <ToolbarButton
            active={editor?.isActive("blogHighlight")}
            disabled={toolbarDisabled}
            icon={Highlighter}
            label="Resaltado"
            onClick={() => editor?.chain().focus().toggleBlogHighlight().run()}
          />
          <ToolbarSelect
            disabled={toolbarDisabled}
            icon={Type}
            label="Tamano de texto"
            value={activeTextSize}
            options={[
              { label: "Pequeno", value: "small" },
              { label: "Normal", value: "normal" },
              { label: "Grande", value: "large" },
            ]}
            onChange={(nextSize) => {
              if (isBlogTextSize(nextSize)) {
                editor?.chain().focus().setBlogTextSize(nextSize).run();
              }
            }}
          />

          <div
            className="flex h-10 shrink-0 items-center gap-1 rounded-[14px] border border-border bg-surface px-1.5"
            aria-label="Color de texto"
            role="group"
          >
            <Palette className="size-4 text-muted" aria-hidden="true" />
            <ColorSwatchButton
              active={activeTextColor === "default"}
              disabled={toolbarDisabled}
              label="Color por defecto"
              onClick={() =>
                editor?.chain().focus().unsetBlogTextColor().run()
              }
            />
            {BLOG_TEXT_COLORS.map((color) => (
              <ColorSwatchButton
                key={color.value}
                active={activeTextColor === color.value}
                disabled={toolbarDisabled}
                label={`Color ${color.label}`}
                swatchClassName={color.swatchClassName}
                onClick={() =>
                  editor?.chain().focus().setBlogTextColor(color.value).run()
                }
              />
            ))}
          </div>

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
