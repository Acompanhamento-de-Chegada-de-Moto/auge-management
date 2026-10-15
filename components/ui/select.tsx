"use client";

import {
  Children,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";
import type * as React from "react";
import { cn } from "@/lib/utils";

type SelectItemProps = {
  value: string;
  disabled?: boolean;
  children: ReactNode;
};

type SelectContextProps = {
  placeholder?: string;
  triggerProps: Record<string, unknown>;
  items: ReactElement<SelectItemProps>[];
};

function findParts(children: ReactNode): SelectContextProps {
  let placeholder: string | undefined;
  let triggerProps: Record<string, unknown> = {};
  const items: ReactElement<SelectItemProps>[] = [];

  function visit(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return;
      const childType = child.type as { displayName?: string; name?: string };
      const name = childType.displayName ?? childType.name;

      if (name === "SelectTrigger") {
        triggerProps = child.props as Record<string, unknown>;
      }
      if (name === "SelectValue") {
        const valueProps = child.props as { placeholder?: string };
        placeholder = valueProps.placeholder;
      }
      if (name === "SelectItem") {
        items.push(child as ReactElement<SelectItemProps>);
        return;
      }
      visit((child.props as { children?: ReactNode }).children);
    });
  }

  visit(children);
  return { placeholder, triggerProps, items };
}

function Select({
  children,
  className,
  onValueChange,
  onChange,
  ...props
}: Omit<React.ComponentProps<"select">, "onChange"> & {
  onValueChange?: (value: string) => void;
  onChange?: React.ComponentProps<"select">["onChange"];
}) {
  const { placeholder, triggerProps, items } = findParts(children);
  const {
    className: triggerClassName,
    size: _size,
    ...nativeTriggerProps
  } = triggerProps as React.ComponentProps<"select"> & { size?: string };

  return (
    <select
      data-slot="select"
      className={cn(
        "select h-11 w-full rounded-xl border-base-300 bg-base-100 px-3.5 text-sm shadow-none focus:border-primary focus:outline-2 focus:outline-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 aria-invalid:border-error",
        className,
        typeof triggerClassName === "string" && triggerClassName,
      )}
      {...props}
      {...nativeTriggerProps}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.currentTarget.value);
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {items.map((item, index) => (
        <option
          key={item.key ?? item.props.value ?? index}
          value={item.props.value}
          disabled={item.props.disabled}
        >
          {item.props.children}
        </option>
      ))}
    </select>
  );
}
Select.displayName = "Select";

function SelectGroup({ children }: React.ComponentProps<"div">) {
  return children;
}
SelectGroup.displayName = "SelectGroup";

function SelectValue(
  _props: React.ComponentProps<"span"> & { placeholder?: string },
) {
  return null;
}
SelectValue.displayName = "SelectValue";

function SelectTrigger(
  _props: React.ComponentProps<"select"> & {
    asChild?: boolean;
    size?: "sm" | "default";
  },
) {
  return null;
}
SelectTrigger.displayName = "SelectTrigger";

function SelectContent({
  children,
  position: _position,
  align: _align,
  ..._props
}: React.ComponentProps<"div"> & {
  position?: "popper" | "item-aligned";
  align?: "start" | "center" | "end";
}) {
  return children;
}
SelectContent.displayName = "SelectContent";

function SelectLabel({ children }: React.ComponentProps<"div">) {
  return children;
}
SelectLabel.displayName = "SelectLabel";

function SelectItem(_props: SelectItemProps) {
  return null;
}
SelectItem.displayName = "SelectItem";

function SelectSeparator(_props: React.ComponentProps<"hr">) {
  return null;
}
SelectSeparator.displayName = "SelectSeparator";

function SelectScrollUpButton() {
  return null;
}

function SelectScrollDownButton() {
  return null;
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
