"use client";

import {
 CircleCheckIcon,
 InfoIcon,
 Loader2Icon,
 OctagonXIcon,
 TriangleAlertIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useTheme } from "@/components/theme/theme-provider";

const Toaster = ({ ...props }: ToasterProps) => {
 const { theme } = useTheme();

 return (
 <Sonner
 theme={theme}
 position="top-right"
 className="toaster group"
 containerAriaLabel="Notificaciones"
 icons={{
 success: (
 <CircleCheckIcon className="size-4 text-success" aria-hidden="true" />
 ),
 info: <InfoIcon className="size-4 text-primary" aria-hidden="true" />,
 warning: (
 <TriangleAlertIcon className="size-4 text-warning" aria-hidden="true" />
 ),
 error: (
 <OctagonXIcon className="size-4 text-danger" aria-hidden="true" />
 ),
 loading: (
 <Loader2Icon
 className="size-4 animate-spin text-primary"
 aria-hidden="true"
 />
 ),
 }}
 style={
 {
 "--normal-bg": "var(--popover)",
 "--normal-text": "var(--popover-foreground)",
 "--normal-border": "var(--border)",
 "--border-radius": "var(--radius-lg)",
 } as CSSProperties
 }
 toastOptions={{
 classNames: {
 toast: "cn-toast ",
 },
 }}
 {...props}
 />
 );
};

export { Toaster };
