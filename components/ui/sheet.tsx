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
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);
function useSheet() {
  const context = useContext(SheetContext);
  if (!context) throw new Error("Sheet part must be inside Sheet");
  return context;
}

function Sheet({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  asChild = false,
  children,
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen } = useSheet();
  const triggerProps = {
    ...props,
    type: "button" as const,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);
      setOpen(true);
    },
  };
  if (asChild) return <Slot.Root {...triggerProps}>{children}</Slot.Root>;
  return <button {...triggerProps}>{children}</button>;
}

function SheetClose({
  asChild = false,
  children,
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen } = useSheet();
  const closeProps = {
    ...props,
    type: "button" as const,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);
      setOpen(false);
    },
  };
  if (asChild) return <Slot.Root {...closeProps}>{children}</Slot.Root>;
  return <button {...closeProps}>{children}</button>;
}

function SheetPortal({ children }: { children: ReactNode }) {
  return children;
}

function SheetOverlay({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  onCancel,
  onClose,
  ...props
}: ComponentProps<"dialog"> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}) {
  const { open, setOpen } = useSheet();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const sideClasses = {
    left: "inset-y-0 left-0 h-full w-[min(88vw,22rem)]",
    right: "inset-y-0 right-0 h-full w-[min(88vw,22rem)]",
    top: "inset-x-0 top-0 max-h-[85dvh] w-full",
    bottom: "inset-x-0 bottom-0 max-h-[85dvh] w-full",
  };

  return (
    <dialog
      ref={dialogRef}
      data-slot="sheet-content"
      aria-modal="true"
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/35 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        onCancel?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          setOpen(false);
        }
      }}
      onClose={(event) => {
        onClose?.(event);
        setOpen(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        className={cn(
          "fixed z-50 flex flex-col gap-4 overflow-y-auto border-base-300/70 bg-base-100 text-sm text-base-content shadow-2xl",
          sideClasses[side],
          side === "left" && "border-r",
          side === "right" && "border-l",
          side === "top" && "rounded-b-3xl border-b",
          side === "bottom" && "rounded-t-3xl border-t",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetClose asChild>
            <Button
              variant="ghost"
              className="absolute right-3 top-3"
              size="icon-sm"
              aria-label="Fechar painel"
            >
              <XIcon aria-hidden="true" />
            </Button>
          </SheetClose>
        )}
      </section>
    </dialog>
  );
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1 p-4", className)} {...props} />
  );
}
function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}
function SheetTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-base font-semibold text-base-content", className)}
      {...props}
    />
  );
}
function SheetDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-base-content/65", className)} {...props} />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
};
