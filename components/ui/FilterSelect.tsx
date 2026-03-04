"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type FilterSelectProps<T extends string> = {
  value: T;
  onValueChange: (v: T) => void;
  placeholder: string;
  options: ReadonlyArray<SelectOption<T>>;
  disabled?: boolean;

  containerClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export default function FilterSelect<T extends string>({
  value,
  onValueChange,
  placeholder,
  options,
  disabled = false,
  containerClassName,
  triggerClassName,
  contentClassName,
}: FilterSelectProps<T>) {
  return (
    <div className={containerClassName}>
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          className={
            triggerClassName ??
            `
            group inline-flex h-11 w-full items-center justify-between gap-3
            rounded-[10px] border border-[#CDE3BD] bg-white px-4 text-sm
            text-[#14532D] shadow-sm outline-none transition
            focus:border-[#4CA771] focus:ring-2 focus:ring-[#4CA771]/25
            disabled:bg-gray-50 disabled:opacity-60
          `
          }
          aria-label={placeholder}
        >
          <SelectPrimitive.Value className="truncate" placeholder={placeholder} />
          <SelectPrimitive.Icon className="text-[#2F6B3D]/70">
            <ChevronDown className="h-4 w-4 transition group-data-[state=open]:rotate-180" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className={
              contentClassName ??
              `
              z-[200] w-[var(--radix-select-trigger-width)]
              overflow-hidden rounded-xl border border-[#CDE3BD]
              bg-white shadow-lg
            `
            }
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="
                    flex cursor-pointer select-none items-center rounded-lg
                    px-3 py-2 text-sm text-[#14532D] outline-none
                    hover:bg-[#F4FBF1] data-[highlighted]:bg-[#F4FBF1]
                  "
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
