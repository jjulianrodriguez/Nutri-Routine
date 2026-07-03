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

export const primitiveSurfaceClasses = {
 canvas: "bg-canvas text-text-primary",
 surface: "bg-surface-default text-text-primary",
 muted: "bg-surface-subtle text-text-secondary",
 raised: "bg-surface-raised text-text-primary shadow-elevation-2",
 inverse: "bg-surface-inverse text-text-inverse",
} as const

export const primitiveToneClasses = {
 default: "bg-surface-default text-text-primary border-border-default",
 muted: "bg-surface-subtle text-text-muted border-border-default",
 primary:
  "bg-action-primary-soft text-action-primary-hover border-action-primary/30",
 secondary:
  "bg-action-secondary-soft text-action-secondary-hover border-action-secondary/30",
 success:
  "bg-status-success-surface text-status-success-text border-status-success/30",
 warning:
  "bg-status-warning-surface text-status-warning-text border-status-warning/30",
 danger: "bg-status-danger-surface text-status-danger-text border-status-danger/30",
 notice: "bg-status-notice-surface text-status-notice-text border-status-notice/30",
} as const

export const primitiveIconSizeClasses = {
 xs: "size-icon-xs",
 sm: "size-icon-sm",
 md: "size-icon-md",
 lg: "size-icon-lg",
 xl: "size-icon-xl",
 "2xl": "size-icon-2xl",
} as const

