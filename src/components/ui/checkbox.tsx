"use client"

import { Check } from "lucide-react"
import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import {
 checkboxControlVariants,
 getBooleanControlStateAttributes,
 type BooleanControlSize,
} from "@/components/ui/boolean-control"
import { composeClasses } from "@/components/ui/composition"

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
   className,
   disabled,
   invalid = false,
   size = "default",
   children,
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
    className={composeClasses(checkboxControlVariants({ size }), className)}
    {...getBooleanControlStateAttributes({ disabled, invalid })}
    {...props}
   >
    {children ?? (
     <CheckboxPrimitive.Indicator data-slot="checkbox-indicator">
      <Check aria-hidden="true" strokeWidth={3} />
     </CheckboxPrimitive.Indicator>
    )}
   </CheckboxPrimitive.Root>
  )
 },
)

Checkbox.displayName = "Checkbox"

export { Checkbox, type CheckboxProps }
