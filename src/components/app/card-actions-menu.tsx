"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { DropdownMenu } from "radix-ui";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CardActionItem = {
  destructive?: boolean;
  disabled?: boolean;
  external?: boolean;
  href?: string;
  icon: LucideIcon;
  label: string;
  onSelect?: () => void;
  separatorBefore?: boolean;
};

type CardActionsMenuProps = {
  items: CardActionItem[];
  label: string;
};

const itemClasses =
  "flex min-h-10 cursor-default select-none items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold text-charcoal outline-none transition-colors focus:bg-primary-soft focus:text-charcoal data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

export function CardActionsMenu({ items, label }: CardActionsMenuProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label={`Acciones de ${label}`}
          title={`Acciones de ${label}`}
          className="shrink-0"
        >
          <MoreHorizontal className="size-5" aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[120] max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-52 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-[18px] border border-border bg-surface/88 p-1.5 shadow-premium backdrop-blur-xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
              </>
            );

            return (
              <Fragment key={item.label}>
                {item.separatorBefore ? (
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                ) : null}

                {item.href ? (
                  <DropdownMenu.Item
                    asChild
                    disabled={item.disabled}
                    className={cn(
                      itemClasses,
                      item.destructive &&
                        "text-danger focus:bg-danger/10 focus:text-danger",
                    )}
                  >
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content}
                      </a>
                    ) : (
                      <Link href={item.href}>{content}</Link>
                    )}
                  </DropdownMenu.Item>
                ) : (
                  <DropdownMenu.Item
                    disabled={item.disabled}
                    onSelect={item.onSelect}
                    className={cn(
                      itemClasses,
                      item.destructive &&
                        "text-danger focus:bg-danger/10 focus:text-danger",
                    )}
                  >
                    {content}
                  </DropdownMenu.Item>
                )}
              </Fragment>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
