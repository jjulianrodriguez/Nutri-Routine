export const primitiveMotionClasses = {
 standard:
  "transition-[background-color,border-color,box-shadow,color,opacity,transform] duration-base ease-standard motion-reduce:transition-none",
 instant: "duration-0 motion-reduce:transition-none",
 enter: "duration-base ease-enter motion-reduce:transition-none",
 exit: "duration-fast ease-exit motion-reduce:transition-none",
} as const

export const primitiveStateClasses = {
 focusRing:
  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/25",
 formFocus:
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring/20 focus-visible:shadow-focus-ring aria-invalid:focus-visible:ring-status-danger/25 aria-invalid:focus-visible:shadow-none",
 disabled:
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-disabled",
 invalid:
  "aria-invalid:border-status-danger aria-invalid:ring-3 aria-invalid:ring-status-danger/20",
 selected:
  "data-[state=active]:bg-surface-interactive data-[state=active]:text-text-primary data-selected:bg-surface-interactive",
 loading: "aria-busy:pointer-events-none aria-busy:cursor-wait",
} as const

export const primitiveLayoutClasses = {
 control:
  "inline-flex shrink-0 items-center justify-center rounded-control whitespace-nowrap",
 iconOnly:
  "inline-flex size-10 shrink-0 items-center justify-center rounded-control",
 iconChild:
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon-md",
 touchTarget: "min-h-touch-target min-w-touch-target",
 stackXs: "space-y-stack-xs",
 stackSm: "space-y-stack-sm",
 stackMd: "space-y-stack-md",
 stackLg: "space-y-stack-lg",
 inlineXs: "gap-inline-xs",
 inlineSm: "gap-inline-sm",
 inlineMd: "gap-inline-md",
 inlineLg: "gap-inline-lg",
} as const
