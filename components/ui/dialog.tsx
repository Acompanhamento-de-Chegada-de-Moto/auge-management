"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type * as React from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("Dialog part must be inside Dialog");
  return context;
}

function Dialog({
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
  const titleId = useId();
  const descriptionId = useId();
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <DialogContext.Provider value={{ open, setOpen, titleId, descriptionId }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  asChild = false,
  children,
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const { open, setOpen } = useDialog();
  const triggerProps = {
    ...props,
    type: "button" as const,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "data-slot": "dialog-trigger",
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      props.onClick?.(event as React.MouseEvent<HTMLButtonElement>);
      setOpen(true);
    },
  };

  if (asChild) return <Slot.Root {...triggerProps}>{children}</Slot.Root>;
  return <button {...triggerProps}>{children}</button>;
}

function DialogPortal({ children }: { children: ReactNode }) {
  return children;
}

function DialogClose({
  asChild = false,
  children,
  onClick,
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen } = useDialog();
  const closeProps = {
    ...props,
    type: "button" as const,
    "data-slot": "dialog-close",
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
      setOpen(false);
    },
  };
  if (asChild) return <Slot.Root {...closeProps}>{children}</Slot.Root>;
  return <button {...closeProps}>{children}</button>;
}

function DialogOverlay() {
  return null;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  role = "dialog",
  onClose,
  onCancel,
  ...props
}: ComponentProps<"dialog"> & { showCloseButton?: boolean }) {
  const { open, setOpen, titleId, descriptionId } = useDialog();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;

    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  if (!portalContainer) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      data-slot="dialog-content"
      role={role}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="modal fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-4 backdrop:bg-black/35 backdrop:backdrop-blur-sm"
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
      {...props}
    >
      <section
        className={cn(
          "modal-box relative my-auto box-border max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-x-hidden overflow-y-auto rounded-3xl border border-base-300/70 bg-base-100 p-6 text-sm text-base-content shadow-2xl",
          className,
        )}
      >
        {children}
        {showCloseButton && (
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="absolute right-3 top-3"
              size="icon-sm"
              aria-label="Fechar diálogo"
            >
              <XIcon aria-hidden="true" />
            </Button>
          </DialogClose>
        )}
      </section>
    </dialog>,
    portalContainer,
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: ComponentProps<"div"> & { showCloseButton?: boolean }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-6 -mb-6 mt-2 flex flex-col-reverse gap-2 rounded-b-3xl border-t border-base-300/70 bg-base-200/70 p-5 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClose asChild>
          <Button variant="outline">Fechar</Button>
        </DialogClose>
      )}
    </div>
  );
}

function DialogTitle({ className, id, ...props }: ComponentProps<"h2">) {
  const { titleId } = useDialog();
  return (
    <h2
      id={id ?? titleId}
      data-slot="dialog-title"
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, id, ...props }: ComponentProps<"p">) {
  const { descriptionId } = useDialog();
  return (
    <p
      id={id ?? descriptionId}
      data-slot="dialog-description"
      className={cn("text-sm text-base-content/65", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  useDialog,
};
