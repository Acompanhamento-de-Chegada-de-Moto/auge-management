"use client";

import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type AvatarContextValue = {
  size: "default" | "sm" | "lg";
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
};
const AvatarContext = createContext<AvatarContextValue | null>(null);

function Avatar({
  className,
  size = "default",
  children,
  ...props
}: ComponentProps<"span"> & { size?: "default" | "sm" | "lg" }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <AvatarContext.Provider value={{ size, imageLoaded, setImageLoaded }}>
      <span
        data-slot="avatar"
        data-size={size}
        className={cn(
          "avatar group/avatar relative inline-flex size-8 shrink-0 overflow-hidden rounded-full bg-base-200 align-middle text-base-content after:absolute after:inset-0 after:rounded-full after:border after:border-base-300",
          size === "lg" && "size-10",
          size === "sm" && "size-6",
          className,
        )}
        {...props}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
}

function AvatarImage({
  className,
  onLoad,
  onError,
  ...props
}: ComponentProps<"img">) {
  const context = useContext(AvatarContext);
  return (
    <img
      data-slot="avatar-image"
      className={cn(
        "absolute inset-0 z-10 aspect-square size-full rounded-full object-cover",
        className,
      )}
      onLoad={(event) => {
        onLoad?.(event);
        context?.setImageLoaded(true);
      }}
      onError={(event) => {
        onError?.(event);
        context?.setImageLoaded(false);
      }}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  const context = useContext(AvatarContext);
  if (context?.imageLoaded) return null;
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-base-200 text-sm font-medium text-base-content group-data-[size=sm]/avatar:text-xs",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function AvatarBadge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute bottom-0 right-0 z-20 inline-flex size-2.5 items-center justify-center rounded-full bg-primary text-primary-content ring-2 ring-base-100",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-base-100",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  children,
  ...props
}: ComponentProps<"div"> & { children?: ReactNode }) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-base-200 text-sm text-base-content ring-2 ring-base-100",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
