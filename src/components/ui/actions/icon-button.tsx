"use client"

import * as React from "react"

import { Button, type ButtonProps } from "@/components/ui/actions/button-core"
import { composeClasses } from "@/components/ui/utilities/composition"
import { primitiveLayoutClasses } from "@/components/ui/utilities/shared-classes"
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/overlays/tooltip"

type IconButtonSize = "icon" | "icon-xs" | "icon-sm" | "icon-lg"

type IconButtonProps = Omit<
 ButtonProps,
 "aria-label" | "children" | "loadingLabel" | "size"
> & {
 children: React.ReactNode
 label: string
 loadingLabel?: string
 size?: IconButtonSize
 tooltip?: React.ReactNode
 tooltipAlign?: React.ComponentProps<typeof TooltipContent>["align"]
 tooltipClassName?: string
 tooltipSide?: React.ComponentProps<typeof TooltipContent>["side"]
}

function IconButton({
 children,
 className,
 label,
 loading = false,
 loadingLabel,
 size = "icon",
 title,
 tooltip,
 tooltipAlign,
 tooltipClassName,
 tooltipSide,
 ...props
}: IconButtonProps) {
 const accessibleLabel = loading && loadingLabel ? loadingLabel : label
 const button = (
  <Button
   aria-label={accessibleLabel}
   data-action="icon"
   size={size}
   title={title ?? (tooltip ? undefined : label)}
   className={composeClasses(primitiveLayoutClasses.touchTarget, className)}
   loading={loading}
   {...props}
  >
   {loading ? null : children}
  </Button>
 )

 if (!tooltip) {
  return button
 }

 return (
  <TooltipProvider>
   <Tooltip>
    <TooltipTrigger asChild>{button}</TooltipTrigger>
    <TooltipContent
     align={tooltipAlign}
     side={tooltipSide}
     className={tooltipClassName}
    >
     {tooltip}
    </TooltipContent>
   </Tooltip>
  </TooltipProvider>
 )
}

export { IconButton, type IconButtonProps }
