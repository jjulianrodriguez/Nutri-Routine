"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import {
 getBooleanControlStateAttributes,
 switchControlVariants,
 switchThumbVariants,
 type BooleanControlSize,
} from "@/components/ui/forms/boolean-control"
import { composeClasses } from "@/components/ui/utilities/composition"

type SwitchProps = React.ComponentPropsWithoutRef<
 typeof SwitchPrimitive.Root
> & {
 invalid?: boolean
 size?: BooleanControlSize
}

const Switch = React.forwardRef<
 React.ElementRef<typeof SwitchPrimitive.Root>,
 SwitchProps
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
   <SwitchPrimitive.Root
    ref={ref}
    data-slot="switch"
    data-size={size}
    disabled={disabled}
    className={composeClasses(switchControlVariants({ size }), className)}
    {...getBooleanControlStateAttributes({ disabled, invalid })}
    {...props}
   >
    {children ?? (
     <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={switchThumbVariants({ size })}
     />
    )}
   </SwitchPrimitive.Root>
  )
 },
)

Switch.displayName = "Switch"

export { Switch, type SwitchProps }
