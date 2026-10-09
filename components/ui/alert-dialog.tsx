"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  useDialog,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const AlertDialog = Dialog;
const AlertDialogTrigger = DialogTrigger;

function AlertDialogContent({
  className,
  size: _size,
  ...props
}: ComponentProps<typeof DialogContent> & { size?: "default" | "sm" }) {
  return (
    <DialogContent
      role="alertdialog"
      className={cn("max-w-sm", className)}
      {...props}
    />
  );
}

function AlertDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle(props: ComponentProps<typeof DialogTitle>) {
  return <DialogTitle {...props} />;
}

function AlertDialogDescription(
  props: ComponentProps<typeof DialogDescription>,
) {
  return <DialogDescription {...props} />;
}

function AlertDialogMedia({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mb-1 inline-flex size-11 items-center justify-center rounded-2xl bg-error/10 text-error",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogAction({
  children,
  className,
  variant = "default",
  size = "default",
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const { setOpen } = useDialog();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      {...props}
    >
      {children as ReactNode}
    </Button>
  );
}

function AlertDialogCancel({
  children,
  className,
  variant = "outline",
  size = "default",
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const { setOpen } = useDialog();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

const AlertDialogPortal = ({ children }: { children: ReactNode }) => children;
const AlertDialogOverlay = () => null;

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
