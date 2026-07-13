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

const inputVariants = defineVariants(
 composeClasses(
  "w-full min-w-0 rounded-control bg-surface-default px-ds-4 py-ds-2 text-base text-text-primary outline-none ring-2 ring-action-primary/30",
  "file:inline-flex file:h-ds-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary",
  "placeholder:text-text-muted focus:bg-action-primary-soft",
  "read-only:cursor-default read-only:bg-surface-subtle read-only:text-text-secondary",
  "aria-invalid:bg-status-danger-surface aria-invalid:ring-status-danger/40",
  "dark:ring-action-primary/40 dark:focus:bg-action-primary-soft",
  "md:text-sm",
  primitiveMotionClasses.standard,
  primitiveStateClasses.disabled,
  primitiveStateClasses.loading,
 ),
 {
  variants: {
   size: {
    sm: "h-ds-10",
    default: "h-11",
    lg: "h-[3.25rem]",
   },
  },
  defaultVariants: {
   size: "default",
  },
 },
)

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
 VariantPropsOf<typeof inputVariants> & {
  invalid?: boolean
  loading?: boolean
 }

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
 {
  className,
  disabled,
  invalid = false,
  loading = false,
  readOnly,
  size = "default",
  type,
  "aria-busy": ariaBusy,
  "aria-invalid": ariaInvalid,
  ...props
 },
 ref,
) {
 const isInvalid =
  invalid || ariaInvalid === true || ariaInvalid === "true"

 return (
  <input
   ref={ref}
   type={type}
   data-slot="input"
   data-size={size}
   data-disabled={disabled ? "true" : undefined}
   data-invalid={isInvalid ? "true" : undefined}
   data-loading={loading ? "true" : undefined}
   data-readonly={readOnly ? "true" : undefined}
   aria-busy={loading ? true : ariaBusy}
   aria-invalid={isInvalid ? true : ariaInvalid}
   disabled={disabled}
   readOnly={readOnly}
   className={composeClasses(inputVariants({ size, className }))}
   {...props}
  />
 )
})

type TypedInputProps = Omit<InputProps, "type">

const EmailInput = React.forwardRef<HTMLInputElement, TypedInputProps>(
 function EmailInput(props, ref) {
  return <Input ref={ref} type="email" {...props} />
 },
)

const NumberInput = React.forwardRef<HTMLInputElement, TypedInputProps>(
 function NumberInput(props, ref) {
  return <Input ref={ref} type="number" {...props} />
 },
)

const SearchInput = React.forwardRef<HTMLInputElement, TypedInputProps>(
 function SearchInput(props, ref) {
  return <Input ref={ref} type="search" {...props} />
 },
)

EmailInput.displayName = "EmailInput"
Input.displayName = "Input"
NumberInput.displayName = "NumberInput"
SearchInput.displayName = "SearchInput"

export {
 EmailInput,
 Input,
 NumberInput,
 SearchInput,
 inputVariants,
 type InputProps,
 type TypedInputProps,
}
