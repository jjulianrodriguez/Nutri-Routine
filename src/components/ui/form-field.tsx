"use client"

import * as React from "react"

import {
 composeClasses,
 defineVariants,
 type VariantPropsOf,
} from "@/components/ui/composition"
import { Label } from "@/components/ui/label"

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
    {React.isValidElement<ControlChildProps>(children) ? (
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

type FieldGroupProps = React.ComponentPropsWithoutRef<"fieldset"> & {
 description?: React.ReactNode
 legend?: React.ReactNode
 legendClassName?: string
}

function FieldGroup({
 children,
 className,
 description,
 legend,
 legendClassName,
 ...props
}: FieldGroupProps) {
 return (
  <fieldset
   data-slot="field-group"
   className={composeClasses("space-y-3", className)}
   {...props}
  >
   {legend ? (
    <legend
     data-slot="field-group-legend"
     className={composeClasses("font-extrabold text-foreground", legendClassName)}
    >
     {legend}
    </legend>
   ) : null}
   {description ? <FieldHint>{description}</FieldHint> : null}
   {children}
  </fieldset>
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
 formAlertVariants,
 formFieldVariants,
 type FieldErrorProps,
 type FieldGroupProps,
 type FieldHintProps,
 type FieldLabelProps,
 type FormAlertProps,
 type FormControlProps,
 type FormFieldProps,
 type RequiredIndicatorProps,
}
