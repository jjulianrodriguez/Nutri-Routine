import * as React from "react"
import { ChevronDown } from "lucide-react"

import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/composition"
import {
 primitiveMotionClasses,
 primitiveStateClasses,
} from "@/components/ui/shared-classes"

const selectVariants = defineVariants(
 composeClasses(
  "peer w-full min-w-0 appearance-none rounded-control border border-transparent bg-clip-padding font-semibold text-foreground outline-none ring-2 ring-primary/30",
  "placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-disabled",
  "aria-invalid:bg-status-danger-surface aria-invalid:ring-status-danger/35 dark:ring-primary/40",
  primitiveMotionClasses.standard,
  primitiveStateClasses.focusRing,
 ),
 {
  variants: {
   variant: {
    default:
     "bg-surface focus:bg-primary-soft dark:focus:bg-primary-soft",
    outline:
     "border-border-default bg-surface-default ring-0 hover:bg-surface-interactive focus-visible:border-focus-ring",
    secondary:
     "bg-action-secondary-soft text-action-secondary-hover ring-action-secondary/20 focus:bg-action-secondary-soft",
    ghost:
     "bg-transparent ring-0 hover:bg-surface-interactive focus-visible:bg-surface-interactive",
   },
   size: {
    xs: "h-ds-8 px-ds-3 py-ds-1 text-xs",
    sm: "h-[calc(var(--ds-space-8)+var(--ds-space-1))] px-ds-3 py-ds-1-5 text-sm",
    default: "h-ds-11 px-ds-4 py-ds-2 text-base md:text-sm",
    lg: "h-ds-12 px-ds-4 py-ds-2 text-base",
   },
  },
  defaultVariants: {
   size: "default",
   variant: "default",
  },
 },
)

type SelectOption = {
 disabled?: boolean
 label: React.ReactNode
 value: string
}

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> &
 VariantPropsOf<typeof selectVariants> & {
  containerClassName?: string
  error?: React.ReactNode
  errorClassName?: string
  helper?: React.ReactNode
  helperClassName?: string
  icon?: React.ReactNode
  invalid?: boolean
  label?: React.ReactNode
  labelClassName?: string
  options?: readonly SelectOption[]
  placeholder?: string
 }

function mergeIds(...ids: Array<string | false | null | undefined>) {
 return ids.filter(Boolean).join(" ") || undefined
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
 function Select(
  {
   "aria-describedby": ariaDescribedBy,
   "aria-invalid": ariaInvalid,
   children,
   className,
   containerClassName,
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
   options,
   placeholder,
   size,
   variant,
   ...props
  },
  ref,
 ) {
  const generatedId = React.useId()
  const selectId = id ?? generatedId
  const helperId = helper ? `${selectId}-helper` : undefined
  const errorId = error ? `${selectId}-error` : undefined
  const isInvalid =
   invalid ||
   Boolean(error) ||
   ariaInvalid === true ||
   ariaInvalid === "true" ||
   ariaInvalid === "grammar" ||
   ariaInvalid === "spelling"

  const control = (
   <div className="relative">
    {icon ? (
     <span
      data-slot="select-leading-icon"
      className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-muted"
      aria-hidden="true"
     >
      {icon}
     </span>
    ) : null}
    <select
     ref={ref}
     id={selectId}
     disabled={disabled}
     aria-describedby={mergeIds(ariaDescribedBy, helperId, errorId)}
     aria-invalid={isInvalid || undefined}
     data-slot="select"
     data-size={size ?? "default"}
     data-variant={variant ?? "default"}
     data-disabled={disabled ? "true" : undefined}
     data-invalid={isInvalid ? "true" : undefined}
     className={composeClasses(
      selectVariants({ size, variant }),
      icon ? "pl-ds-10" : null,
      "pr-ds-10",
      className,
     )}
     {...props}
    >
     {placeholder ? (
      <option value="" disabled hidden>
       {placeholder}
      </option>
     ) : null}
     {options
      ? options.map((option) => (
       <option
        key={option.value}
        value={option.value}
        disabled={option.disabled}
       >
        {option.label}
       </option>
      ))
      : children}
    </select>
    <ChevronDown
     className="pointer-events-none absolute right-3 top-1/2 z-[1] size-icon-md -translate-y-1/2 text-muted"
     aria-hidden="true"
    />
   </div>
  )

  return (
   <div
    data-slot="select-field"
    className={composeClasses("grid gap-1.5", containerClassName)}
   >
    {label ? (
     <label
      htmlFor={selectId}
      data-slot="select-label"
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
      data-slot="select-helper"
      className={composeClasses("text-sm leading-6 text-muted", helperClassName)}
     >
      {helper}
     </p>
    ) : null}
    {error ? (
     <p
      id={errorId}
      data-slot="select-error"
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

Select.displayName = "Select"

export {
 Select,
 selectVariants,
 type SelectOption,
 type SelectProps,
}
