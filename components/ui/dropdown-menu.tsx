"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import type * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slot } from "@/components/ui/slot";

type MenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error("Menu item must be inside DropdownMenu");
  return context;
}

function DropdownMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}: {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
} & Omit<ComponentProps<"div">, "onChange">) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <MenuContext.Provider value={{ open, setOpen, rootRef, triggerRef }}>
      <div
        ref={rootRef}
        data-slot="dropdown-menu"
        className="relative inline-flex"
        {...props}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
}

function DropdownMenuPortal({ children }: { children: ReactNode }) {
  return children;
}

function DropdownMenuTrigger({
  asChild = false,
  children,
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const { open, setOpen, triggerRef } = useMenu();
  const triggerProps = {
    ...props,
    "aria-haspopup": "menu" as const,
    "aria-expanded": open,
    "data-slot": "dropdown-menu-trigger",
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);
      setOpen(!open);
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      props.onKeyDown?.(event);
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setOpen(true);
      }
    },
  };

  if (asChild) {
    return (
      <Slot.Root {...triggerProps} ref={triggerRef}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      type="button"
      {...triggerProps}
      ref={(element) => {
        triggerRef.current = element;
      }}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  className,
  children,
  align = "start",
  side = "bottom",
  sideOffset: _sideOffset,
  ...props
}: ComponentProps<"div"> & {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}) {
  const { open, setOpen, rootRef, triggerRef } = useMenu();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    contentRef.current
      ?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
      ?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const items = Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>(
          '[role="menuitem"]:not([disabled])',
        ) ?? [],
      );
      const current = items.indexOf(document.activeElement as HTMLElement);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next = (current + direction + items.length) % items.length;
      items[next]?.focus();
      event.preventDefault();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, rootRef, setOpen, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="menu"
      data-slot="dropdown-menu-content"
      className={cn(
        "menu absolute z-50 max-h-[min(70vh,32rem)] min-w-44 overflow-y-auto rounded-2xl border border-base-300/70 bg-base-100 p-1.5 text-base-content shadow-xl",
        side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        align === "end"
          ? "right-0"
          : align === "center"
            ? "left-1/2 -translate-x-1/2"
            : "left-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuGroup({ children }: { children: ReactNode }) {
  return <div role="group">{children}</div>;
}

function DropdownMenuLabel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn(
        "px-2.5 py-2 text-xs font-semibold text-base-content/60",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  variant = "default",
  inset: _inset,
  onSelect,
  onClick,
  ...props
}: ComponentProps<"button"> & {
  variant?: "default" | "destructive";
  inset?: boolean;
  onSelect?: (event: React.SyntheticEvent<HTMLButtonElement>) => void;
}) {
  const { setOpen } = useMenu();
  return (
    <button
      type="button"
      role="menuitem"
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        "flex min-h-10 w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-base-200 focus-visible:bg-base-200 focus-visible:outline-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50",
        variant === "destructive" &&
          "text-error hover:bg-error/10 focus-visible:bg-error/10",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        onSelect?.(event);
        setOpen(false);
      }}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  children,
  checked,
  onCheckedChange,
  ...props
}: ComponentProps<"button"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <DropdownMenuItem
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <CheckIcon className={cn("size-4", !checked && "opacity-0")} />
      {children}
    </DropdownMenuItem>
  );
}

function DropdownMenuRadioGroup({
  children,
  value: _value,
  onValueChange: _onValueChange,
}: {
  children: ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return <div role="group">{children}</div>;
}

function DropdownMenuRadioItem({
  children,
  value,
  ...props
}: ComponentProps<"button"> & { value: string }) {
  return (
    <DropdownMenuItem role="menuitemradio" data-value={value} {...props}>
      {children}
    </DropdownMenuItem>
  );
}

function DropdownMenuSeparator({ className, ...props }: ComponentProps<"hr">) {
  return (
    <hr
      className={cn("my-1 border-0 border-t border-base-300/70", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("ml-auto text-xs text-base-content/50", className)}
      {...props}
    />
  );
}

const DropdownMenuSub = DropdownMenuGroup;
const DropdownMenuSubTrigger = DropdownMenuItem;
const DropdownMenuSubContent = DropdownMenuContent;

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
