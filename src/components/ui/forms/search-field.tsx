"use client"

import { Loader2, Search, X } from "lucide-react"
import * as React from "react"

import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/utilities/composition"
import {
 primitiveMotionClasses,
 primitiveStateClasses,
} from "@/components/ui/utilities/shared-classes"

const searchFieldInputVariants = defineVariants(
 composeClasses(
  "peer w-full min-w-0 rounded-control border border-transparent bg-clip-padding font-semibold text-foreground outline-none placeholder:text-muted-foreground",
  "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
  "read-only:cursor-default read-only:bg-surface-subtle read-only:text-text-secondary",
  "aria-invalid:bg-status-danger-surface aria-invalid:ring-status-danger/35",
  primitiveMotionClasses.standard,
  primitiveStateClasses.focusRing,
  primitiveStateClasses.disabled,
  primitiveStateClasses.loading,
 ),
 {
  variants: {
   size: {
    sm: "h-[calc(var(--ds-space-8)+var(--ds-space-1))] px-ds-3 py-ds-1-5 text-sm",
    default: "h-ds-11 px-ds-4 py-ds-2 text-base md:text-sm",
    lg: "h-ds-12 px-ds-4 py-ds-2 text-base",
   },
   variant: {
    default:
     "bg-surface ring-2 ring-primary/30 focus:bg-primary-soft dark:ring-primary/40 dark:focus:bg-primary-soft",
    outline:
     "border-border-default bg-surface-default ring-0 hover:bg-surface-interactive focus-visible:border-focus-ring",
    secondary:
     "bg-action-secondary-soft text-action-secondary-hover ring-2 ring-action-secondary/20 focus:bg-action-secondary-soft",
    ghost:
     "bg-transparent ring-0 hover:bg-surface-interactive focus-visible:bg-surface-interactive",
   },
  },
  defaultVariants: {
   size: "default",
   variant: "default",
  },
 },
)

type SearchFieldProps = Omit<React.ComponentProps<"input">, "size" | "type"> &
 VariantPropsOf<typeof searchFieldInputVariants> & {
  clearLabel?: string
  clearable?: boolean
  containerClassName?: string
  controlClassName?: string
  debounceMs?: number
  error?: React.ReactNode
  errorClassName?: string
  helper?: React.ReactNode
  helperClassName?: string
  icon?: React.ReactNode
  invalid?: boolean
  label?: React.ReactNode
  labelClassName?: string
  loading?: boolean
  onClear?: () => void
  onValueChange?: (value: string) => void
 }

function mergeDescriptions(
 ...descriptions: Array<string | false | null | undefined>
): string | undefined {
 return descriptions.filter(Boolean).join(" ") || undefined
}

function stringifySearchValue(value: React.ComponentProps<"input">["value"]) {
 if (Array.isArray(value)) {
  return value.join(" ")
 }

 if (value === undefined || value === null) {
  return ""
 }

 return String(value)
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
 function SearchField(
  {
   "aria-describedby": ariaDescribedBy,
   "aria-invalid": ariaInvalid,
   className,
   clearLabel = "Limpiar busqueda",
   clearable = true,
   containerClassName,
   controlClassName,
   debounceMs,
   defaultValue,
   disabled,
   error,
   errorClassName,
   helper,
   helperClassName,
   icon,
   id,
   invalid,
   label,
   labelClassName,
   loading = false,
   onChange,
   onClear,
   onValueChange,
   readOnly,
   size = "default",
   value,
   variant = "default",
   ...props
  },
  ref,
 ) {
  const generatedId = React.useId()
  const fieldId = id ?? generatedId
  const helperId = helper ? `${fieldId}-helper` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const timeoutRef = React.useRef<number | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const valueProp = stringifySearchValue(value)
  const defaultValueProp = stringifySearchValue(defaultValue)
  const [displayValue, setDisplayValue] = React.useState(
   value === undefined ? defaultValueProp : valueProp,
  )
  const isInvalid =
   invalid ||
   Boolean(error) ||
   ariaInvalid === true ||
   ariaInvalid === "true" ||
   ariaInvalid === "grammar" ||
   ariaInvalid === "spelling"
  const hasValue = displayValue.length > 0
  const leadingIcon =
   icon === undefined ? (
    <Search className="size-icon-md" aria-hidden="true" />
   ) : (
    icon
   )
  const hasLeadingIcon = leadingIcon !== null && leadingIcon !== false
  const hasEndSlot = loading || clearable

  const setInputRef = React.useCallback(
   (node: HTMLInputElement | null) => {
    inputRef.current = node

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

  const clearPendingChange = React.useCallback(() => {
   if (timeoutRef.current) {
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
   }
  }, [])

  const emitValueChange = React.useCallback(
   (nextValue: string, immediate = false) => {
    clearPendingChange()

    if (!onValueChange) {
     return
    }

    if (debounceMs && debounceMs > 0 && !immediate) {
     timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null
      onValueChange(nextValue)
     }, debounceMs)
     return
    }

    onValueChange(nextValue)
   },
   [clearPendingChange, debounceMs, onValueChange],
  )

  React.useEffect(() => {
   if (value !== undefined) {
    setDisplayValue(valueProp)
   }
  }, [value, valueProp])

  React.useEffect(() => clearPendingChange, [clearPendingChange])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
   const nextValue = event.currentTarget.value

   setDisplayValue(nextValue)
   onChange?.(event)
   emitValueChange(nextValue)
  }

  function handleClear() {
   if (disabled || readOnly || loading) {
    return
   }

   setDisplayValue("")
   emitValueChange("", true)
   onClear?.()
   inputRef.current?.focus()
  }

  const control = (
   <div
    data-slot="search-field-control"
    className={composeClasses("relative", controlClassName)}
   >
    {hasLeadingIcon ? (
     <span
      data-slot="search-field-icon"
      className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-muted"
      aria-hidden="true"
     >
      {leadingIcon}
     </span>
    ) : null}
    <input
     ref={setInputRef}
     id={fieldId}
     type="search"
     value={displayValue}
     disabled={disabled}
     readOnly={readOnly}
     aria-busy={loading || undefined}
     aria-describedby={mergeDescriptions(
      ariaDescribedBy,
      helperId,
      errorId,
     )}
     aria-invalid={isInvalid ? true : ariaInvalid}
     data-slot="search-field"
     data-size={size}
     data-variant={variant}
     data-disabled={disabled ? "true" : undefined}
     data-invalid={isInvalid ? "true" : undefined}
     data-loading={loading ? "true" : undefined}
     data-readonly={readOnly ? "true" : undefined}
     className={composeClasses(
      searchFieldInputVariants({ size, variant }),
      hasLeadingIcon ? "pl-ds-10" : null,
      hasEndSlot ? "pr-16" : null,
      className,
     )}
     onChange={handleChange}
     {...props}
    />
    {hasEndSlot ? (
     <span
      data-slot="search-field-actions"
      className="absolute right-1 top-1/2 z-[1] inline-flex -translate-y-1/2 items-center justify-end"
     >
      {loading ? (
       <Loader2
        data-slot="search-field-loading-icon"
        className="mr-2 size-icon-md animate-spin text-muted"
        aria-hidden="true"
       />
      ) : null}
      {clearable && hasValue ? (
       <button
        type="button"
        className="grid min-h-touch-target min-w-touch-target place-items-center rounded-full text-muted outline-none transition hover:bg-surface-interactive hover:text-foreground focus-visible:ring-3 focus-visible:ring-focus-ring/25 disabled:pointer-events-none disabled:opacity-disabled"
        aria-label={clearLabel}
        aria-controls={fieldId}
        disabled={disabled || readOnly || loading}
        onClick={handleClear}
       >
        <X className="size-icon-sm" aria-hidden="true" />
       </button>
      ) : null}
     </span>
    ) : null}
   </div>
  )

  if (!label && !helper && !error && !containerClassName) {
   return control
  }

  return (
   <div
    data-slot="search-field-container"
    className={composeClasses("grid gap-1.5", containerClassName)}
   >
    {label ? (
     <label
      htmlFor={fieldId}
      data-slot="search-field-label"
      className={composeClasses(
       "text-sm font-extrabold text-foreground",
       labelClassName,
      )}
     >
      {label}
     </label>
    ) : null}
    {control}
    {helper ? (
     <p
      id={helperId}
      data-slot="search-field-helper"
      className={composeClasses("text-sm leading-6 text-muted", helperClassName)}
     >
      {helper}
     </p>
    ) : null}
    {error ? (
     <p
      id={errorId}
      data-slot="search-field-error"
      className={composeClasses("text-sm font-semibold text-danger", errorClassName)}
      role="alert"
     >
      {error}
     </p>
    ) : null}
   </div>
  )
 },
)

SearchField.displayName = "SearchField"

export {
 SearchField,
 searchFieldInputVariants,
 type SearchFieldProps,
}
