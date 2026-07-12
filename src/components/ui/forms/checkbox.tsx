"use client"

import { Check, Minus } from "lucide-react"
import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import {
 checkboxControlVariants,
 checkboxIndicatorVariants,
 getBooleanControlStateAttributes,
 type BooleanControlSize,
} from "@/components/ui/forms/boolean-control"
import { composeClasses } from "@/components/ui/utilities/composition"

type CheckboxProps = React.ComponentPropsWithoutRef<
 typeof CheckboxPrimitive.Root
> & {
 invalid?: boolean
 size?: BooleanControlSize
}

const Checkbox = React.forwardRef<
 React.ElementRef<typeof CheckboxPrimitive.Root>,
 CheckboxProps
>(
 (
  {
   children,
   className,
   disabled,
   invalid = false,
   size = "default",
   ...props
  },
  ref,
 ) => {
  return (
   <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    data-size={size}
    disabled={disabled}
    className={composeClasses(
     "group/checkbox",
     checkboxControlVariants({ size }),
     className,
    )}
    {...getBooleanControlStateAttributes({ disabled, invalid })}
    {...props}
   >
    <CheckboxPrimitive.Indicator
     data-slot="checkbox-indicator"
     className={checkboxIndicatorVariants({ size })}
    >
     {children ?? (
      <>
       <Check
        className="size-full group-data-[state=indeterminate]/checkbox:hidden"
        aria-hidden="true"
       />
       <Minus
        className="hidden size-full group-data-[state=indeterminate]/checkbox:block"
        aria-hidden="true"
       />
      </>
     )}
    </CheckboxPrimitive.Indicator>
   </CheckboxPrimitive.Root>
  )
 },
)

Checkbox.displayName = "Checkbox"

export { Checkbox, type CheckboxProps }
