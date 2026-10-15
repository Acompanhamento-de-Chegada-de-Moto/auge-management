import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type SlotProps = {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
};

function SlotRoot({ children, className, ...props }: SlotProps) {
  if (!children || !isValidElement(children)) return children;

  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = child.props;
  const mergedProps = { ...childProps, ...props } as Record<string, unknown>;

  mergedProps.className = cn(
    typeof childProps.className === "string" ? childProps.className : undefined,
    className,
  );

  for (const key of Object.keys(props)) {
    if (!key.startsWith("on")) continue;
    const parentHandler = props[key];
    const childHandler = childProps[key];
    if (
      typeof parentHandler === "function" &&
      typeof childHandler === "function"
    ) {
      mergedProps[key] = (...args: unknown[]) => {
        (childHandler as (...eventArgs: unknown[]) => void)(...args);
        (parentHandler as (...eventArgs: unknown[]) => void)(...args);
      };
    }
  }

  return cloneElement(child, mergedProps);
}

export const Slot = { Root: SlotRoot };
