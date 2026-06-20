"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Editor } from "@tiptap/core";
import {
  Bold,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
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

function isAllowedEditorUrl(value: string) {
  const url = value.trim();

  return (
    /^https?:\/\//i.test(url) ||
    /^mailto:/i.test(url) ||
    /^tel:/i.test(url) ||
    url.startsWith("/") ||
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

const editorContentClasses = [
  "relative overflow-hidden rounded-b-[22px] border-x border-b border-input bg-surface/90 shadow-soft",
  "[&_.ProseMirror]:min-h-[20rem] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-4 [&_.ProseMirror]:text-base [&_.ProseMirror]:leading-7 [&_.ProseMirror]:text-foreground [&_.ProseMirror]:outline-none sm:[&_.ProseMirror]:px-5",
  "[&_.ProseMirror_a]:font-bold [&_.ProseMirror_a]:text-teal [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-4",
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
            isAllowedEditorUrl(url) || context.defaultValidate(url),
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
      onChange(getEditorHtml(currentEditor));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = getEditorHtml(editor);

    if (value !== currentHtml) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  const toolbarDisabled = disabled || !editor;

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
              editor?.chain().focus().unsetAllMarks().clearNodes().run()
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
        <p className="text-xs font-semibold leading-5 text-muted">
          Formato permitido: texto, titulos, listas, enlaces, citas y
          separadores.
        </p>
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
            emptyMessage="La vista previa aparecera cuando escribas contenido."
            variant="preview"
          />
        </div>
      ) : null}
    </div>
  );
}
