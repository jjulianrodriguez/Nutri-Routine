"use client";

import { Moon, Sun } from "lucide-react";
import { forwardRef } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  onToggle?: () => void;
  showLabel?: boolean;
};

export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, onToggle, showLabel = true }, ref) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const label = isDark ? "Modo oscuro" : "Modo claro";
    const nextLabel = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

    function handleClick() {
      toggleTheme();
      onToggle?.();
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={showLabel ? undefined : label}
        title={nextLabel}
        onClick={handleClick}
        className={cn(
          "inline-flex h-11 min-w-0 items-center justify-center gap-3 rounded-control border border-border bg-surface/78 text-sm font-extrabold text-warm-brown shadow-soft backdrop-blur-md transition-[background-color,border-color,color,box-shadow,transform]",
          "hover:border-primary/30 hover:bg-primary-soft hover:text-charcoal hover:shadow-glow focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
          showLabel ? "px-3" : "size-11 w-11 px-0",
          className,
        )}
      >
        <span
          className="relative grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-charcoal"
          aria-hidden="true"
        >
          <Sun
            className={cn(
              "absolute size-4 transition-[opacity,transform] duration-200",
              isDark
                ? "scale-75 rotate-90 opacity-0"
                : "scale-100 rotate-0 opacity-100",
            )}
          />
          <Moon
            className={cn(
              "absolute size-4 transition-[opacity,transform] duration-200",
              isDark
                ? "scale-100 rotate-0 opacity-100"
                : "scale-75 -rotate-90 opacity-0",
            )}
          />
        </span>
        {showLabel ? (
          <span className="min-w-0 truncate">{label}</span>
        ) : null}
      </button>
    );
  },
);

ThemeToggle.displayName = "ThemeToggle";
