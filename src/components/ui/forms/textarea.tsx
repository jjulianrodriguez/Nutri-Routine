"use client"

import * as React from "react"

import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/utilities/composition"
import { primitiveStateClasses } from "@/components/ui/utilities/shared-classes"

const textareaVariants = defineVariants(
 composeClasses(
  "w-full min-w-0 rounded-control text-foreground outline-none placeholder:text-muted-foreground",
  "transition-[background-color,border-color,box-shadow,color,transform] motion-reduce:transition-none",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "read-only:cursor-default read-only:bg-surface-muted/60",
  "aria-invalid:bg-danger/10 aria-invalid:ring-danger/40",
  primitiveStateClasses.formFocus,
 ),
 {
  variants: {
   resize: {
    both: "resize",
    horizontal: "resize-x",
    none: "resize-none",
    vertical: "resize-y",
   },
   size: {
    sm: "min-h-24 px-3 py-2 text-sm leading-6",
    default: "min-h-28 px-4 py-3 text-sm leading-6",
    lg: "min-h-36 px-4 py-3 text-base leading-7",
   },
   variant: {
    default:
     "bg-surface ring-2 ring-primary/30 focus-visible:bg-surface dark:ring-primary/40",
    ghost:
     "bg-transparent ring-0 focus-visible:bg-surface",
    outline:
     "border-input bg-surface ring-2 ring-primary/30 focus-visible:bg-surface dark:ring-primary/40",
   },
  },
  defaultVariants: {
   resize: "none",
   size: "default",
   variant: "default",
  },
 },
)

type TextareaProps = Omit<React.ComponentProps<"textarea">, "size"> &
 VariantPropsOf<typeof textareaVariants> & {
  autoResize?: boolean
  error?: React.ReactNode
  helper?: React.ReactNode
  invalid?: boolean
 }

function mergeDescriptions(
 ...descriptions: Array<string | undefined>
): string | undefined {
 return descriptions.filter(Boolean).join(" ") || undefined
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 function Textarea(
  {
   autoResize = false,
   className,
   error,
   helper,
   id,
   invalid,
   onInput,
   resize = "none",
   size = "default",
   variant = "default",
   "aria-describedby": ariaDescribedBy,
   "aria-invalid": ariaInvalid,
   ...props
  },
  ref,
 ) {
  const resolvedResize = resize ?? "none"
  const resolvedSize = size ?? "default"
  const resolvedVariant = variant ?? "default"
  const generatedId = React.useId()
  const textareaId = id ?? generatedId
  const helperId = helper ? `${textareaId}-helper` : undefined
  const errorId = error ? `${textareaId}-error` : undefined
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const isInvalid =
   invalid || Boolean(error) || ariaInvalid === true || ariaInvalid === "true"

  const resizeTextarea = React.useCallback(
   (textarea: HTMLTextAreaElement | null = textareaRef.current) => {
    if (!autoResize || !textarea) {
     return
    }

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
   },
   [autoResize],
  )

  React.useLayoutEffect(() => {
   resizeTextarea()
  }, [props.defaultValue, props.value, resizeTextarea])

  const setTextareaRef = React.useCallback(
   (node: HTMLTextAreaElement | null) => {
    textareaRef.current = node

    if (typeof ref === "function") {
     ref(node)
     return
    }

    if (ref) {
     ref.current = node
    }
   },
   [ref],
  )

  const textarea = (
   <textarea
    ref={setTextareaRef}
    id={textareaId}
    data-slot="textarea"
    data-variant={resolvedVariant}
    data-size={resolvedSize}
    data-resize={resolvedResize}
    data-invalid={isInvalid ? "true" : undefined}
    aria-describedby={mergeDescriptions(
     ariaDescribedBy,
     helperId,
     errorId,
    )}
    aria-invalid={isInvalid ? true : ariaInvalid}
    className={composeClasses(
     textareaVariants({
      className,
      resize: resolvedResize,
      size: resolvedSize,
      variant: resolvedVariant,
     }),
    )}
    onInput={(event) => {
     resizeTextarea(event.currentTarget)
     onInput?.(event)
    }}
    {...props}
   />
  )

  if (!helper && !error) {
   return textarea
  }

  return (
   <div data-slot="textarea-field" className="space-y-2">
    {textarea}
    {helper ? (
     <p id={helperId} data-slot="textarea-helper" className="text-sm text-muted">
      {helper}
     </p>
    ) : null}
    {error ? (
     <p
      id={errorId}
      data-slot="textarea-error"
      className="text-sm font-semibold text-danger"
      role="alert"
     >
      {error}
     </p>
    ) : null}
   </div>
  )
 },
)

Textarea.displayName = "Textarea"

export { Textarea, textareaVariants, type TextareaProps }
