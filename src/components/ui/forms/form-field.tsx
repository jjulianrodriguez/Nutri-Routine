"use client"

import * as React from "react"

import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/utilities/composition"
import { Label } from "@/components/ui/forms/label"

function mergeIds(...ids: Array<string | false | null | undefined>) {
 return ids.filter(Boolean).join(" ") || undefined
}

type FormFieldContextValue = {
 controlId: string
 errorId?: string
 hintId?: string
 invalid: boolean
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

function useFormFieldContext() {
 return React.useContext(FormFieldContext)
}

const formFieldVariants = defineVariants("grid gap-2", {
 variants: {
  layout: {
   default: "",
   compact: "gap-1.5",
  },
 },
 defaultVariants: {
  layout: "default",
 },
})

type FormFieldProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> &
 VariantPropsOf<typeof formFieldVariants> & {
  autoControl?: boolean
  children?: React.ReactNode
  controlId?: string
  error?: React.ReactNode
  errorClassName?: string
  errorId?: string
  hint?: React.ReactNode
  hintClassName?: string
  hintId?: string
  invalid?: boolean
  label?: React.ReactNode
  labelClassName?: string
  required?: boolean
 }

function FormField({
 autoControl = true,
 children,
 className,
 controlId,
 error,
 errorClassName,
 errorId: errorIdProp,
 hint,
 hintClassName,
 hintId: hintIdProp,
 invalid,
 label,
 labelClassName,
 layout,
 required,
 ...props
}: FormFieldProps) {
 const generatedId = React.useId()
 const resolvedControlId = controlId ?? generatedId
 const hintId = hint ? (hintIdProp ?? `${resolvedControlId}-hint`) : undefined
 const errorId = error ? (errorIdProp ?? `${resolvedControlId}-error`) : undefined
 const isInvalid = invalid ?? Boolean(error)

 return (
  <FormFieldContext.Provider
   value={{
    controlId: resolvedControlId,
    errorId,
    hintId,
    invalid: isInvalid,
   }}
  >
   <div
    data-slot="form-field"
    data-invalid={isInvalid ? "true" : undefined}
    className={composeClasses(formFieldVariants({ layout }), className)}
    {...props}
   >
    {label ? (
     <FieldLabel className={labelClassName} required={required}>
      {label}
     </FieldLabel>
    ) : null}
    {autoControl &&
    React.isValidElement<ControlChildProps>(children) &&
    children.type !== FormControl ? (
     <FormControl>{children}</FormControl>
    ) : (
     children
    )}
    {hint ? <FieldHint className={hintClassName}>{hint}</FieldHint> : null}
    <FieldError className={errorClassName}>{error}</FieldError>
   </div>
  </FormFieldContext.Provider>
 )
}

type RequiredIndicatorProps = React.ComponentPropsWithoutRef<"span"> & {
 label?: string
}

function RequiredIndicator({
 "aria-label": ariaLabel,
 className,
 label = "Requerido",
 ...props
}: RequiredIndicatorProps) {
 return (
  <span
   aria-label={ariaLabel ?? label}
   className={composeClasses("text-danger", className)}
   data-slot="required-indicator"
   {...props}
  >
   *
  </span>
 )
}

type FieldLabelProps = React.ComponentPropsWithoutRef<typeof Label> & {
 required?: boolean
}

function FieldLabel({
 children,
 className,
 htmlFor,
 required,
 ...props
}: FieldLabelProps) {
 const context = useFormFieldContext()

 return (
  <Label
   data-slot="field-label"
   htmlFor={htmlFor ?? context?.controlId}
   className={composeClasses("font-extrabold text-foreground", className)}
   {...props}
  >
   <span>{children}</span>
   {required ? <RequiredIndicator /> : null}
  </Label>
 )
}

type ControlChildProps = {
 "aria-describedby"?: string
 "aria-invalid"?: boolean | "false" | "grammar" | "spelling" | "true"
 className?: string
 id?: string
}

type FormControlProps = {
 children: React.ReactElement<ControlChildProps>
 className?: string
 describedBy?: string
 id?: string
 invalid?: boolean
}

function FormControl({
 children,
 className,
 describedBy,
 id,
 invalid,
}: FormControlProps) {
 const context = useFormFieldContext()
 const childProps = children.props
 const isInvalid = invalid ?? context?.invalid ?? false

 return React.cloneElement(children, {
  "aria-describedby": mergeIds(
   childProps["aria-describedby"],
   describedBy,
   context?.hintId,
   context?.errorId,
  ),
  "aria-invalid": isInvalid ? true : childProps["aria-invalid"],
  className: composeClasses(childProps.className, className),
  id: id ?? childProps.id ?? context?.controlId,
 })
}

type FieldHintProps = React.ComponentPropsWithoutRef<"p"> & {
 message?: React.ReactNode
}

function FieldHint({
 children,
 className,
 id,
 message,
 ...props
}: FieldHintProps) {
 const context = useFormFieldContext()
 const content = message ?? children

 if (!content) {
  return null
 }

 return (
  <p
   id={id ?? context?.hintId}
   data-slot="field-hint"
   className={composeClasses("text-sm leading-6 text-muted", className)}
   {...props}
  >
   {content}
  </p>
 )
}

type FieldErrorProps = React.ComponentPropsWithoutRef<"p"> & {
 message?: React.ReactNode
}

function FieldError({
 children,
 className,
 id,
 message,
 role = "alert",
 ...props
}: FieldErrorProps) {
 const context = useFormFieldContext()
 const content = message ?? children

 if (!content) {
  return null
 }

 return (
  <p
   id={id ?? context?.errorId}
   data-slot="field-error"
   className={composeClasses("mt-2 text-sm font-semibold text-danger", className)}
   role={role}
   {...props}
  >
   {content}
  </p>
 )
}

const fieldGroupVariants = defineVariants("grid gap-4", {
 variants: {
  layout: {
   default: "",
   compact: "gap-3",
  },
 },
 defaultVariants: {
  layout: "default",
 },
})

type FieldGroupProps = Omit<
 React.ComponentPropsWithoutRef<"fieldset">,
 "children"
> &
 VariantPropsOf<typeof fieldGroupVariants> & {
  children?: React.ReactNode
  description?: React.ReactNode
  descriptionClassName?: string
  descriptionId?: string
  error?: React.ReactNode
  errorClassName?: string
  errorId?: string
  legend?: React.ReactNode
  legendClassName?: string
  required?: boolean
 }

function FieldGroup({
 "aria-describedby": ariaDescribedBy,
 children,
 className,
 description,
 descriptionClassName,
 descriptionId: descriptionIdProp,
 error,
 errorClassName,
 errorId: errorIdProp,
 legend,
 legendClassName,
 layout,
 required,
 ...props
}: FieldGroupProps) {
 const generatedId = React.useId()
 const descriptionId = description
  ? (descriptionIdProp ?? `${generatedId}-description`)
  : undefined
 const errorId = error ? (errorIdProp ?? `${generatedId}-error`) : undefined

 return (
  <fieldset
   data-slot="field-group"
   data-invalid={error ? "true" : undefined}
   aria-describedby={mergeIds(ariaDescribedBy, descriptionId, errorId)}
   className={composeClasses(fieldGroupVariants({ layout }), className)}
   {...props}
  >
   {legend ? (
    <legend
     data-slot="field-group-legend"
     className={composeClasses(
      "mb-2 flex items-center gap-2 text-sm font-extrabold text-foreground",
      legendClassName,
     )}
    >
     <span>{legend}</span>
     {required ? <RequiredIndicator /> : null}
    </legend>
   ) : null}
   {description ? (
    <p
     id={descriptionId}
     data-slot="field-group-description"
     className={composeClasses("mb-3 text-sm leading-6 text-muted", descriptionClassName)}
    >
     {description}
    </p>
   ) : null}
   <div data-slot="field-group-content" className="grid gap-3">
    {children}
   </div>
   <FieldError id={errorId} className={errorClassName}>
    {error}
   </FieldError>
  </fieldset>
 )
}

const formAlertVariants = defineVariants(
 "rounded-[18px] border px-4 py-3 text-sm font-semibold",
 {
  variants: {
   tone: {
    danger: "border-danger/20 bg-danger/5 text-danger",
    notice: "border-primary/30 bg-primary-soft text-foreground",
    success: "border-success/20 bg-success/5 text-success",
   },
  },
  defaultVariants: {
   tone: "danger",
  },
 },
)

type FormAlertProps = React.ComponentPropsWithoutRef<"div"> &
 VariantPropsOf<typeof formAlertVariants> & {
  message?: React.ReactNode
 }

function FormAlert({
 children,
 className,
 message,
 role,
 tone,
 ...props
}: FormAlertProps) {
 const content = message ?? children

 if (!content) {
  return null
 }

 return (
  <div
   data-slot="form-alert"
   role={role ?? (tone === "success" || tone === "notice" ? "status" : "alert")}
   className={composeClasses(formAlertVariants({ tone }), className)}
   {...props}
  >
   {content}
  </div>
 )
}

export {
 FieldError,
 FieldGroup,
 FieldHint,
 FieldLabel,
 FormAlert,
 FormControl,
 FormField,
 RequiredIndicator,
 type FieldErrorProps,
 type FieldGroupProps,
 type FieldHintProps,
 type FieldLabelProps,
 type FormAlertProps,
 type FormControlProps,
 type FormFieldProps,
 type RequiredIndicatorProps,
}
