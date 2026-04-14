"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
const ROLE_OPTIONS = ["USER", "ADMIN", "OWNER"] as const;
type RoleOption = (typeof ROLE_OPTIONS)[number];
interface RolePickerProps {
  name: string;
  defaultValue: RoleOption;
  disabled?: boolean;
  ariaLabel: string;
}
export const RolePicker = ({
  name,
  defaultValue,
  disabled = false,
  ariaLabel,
}: RolePickerProps) => {
  const [selected, setSelected] = useState<RoleOption>(defaultValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const availableOptions = ROLE_OPTIONS.filter((option) => option !== selected);
  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
  return (
    <div ref={rootRef} className="relative shrink-0">
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "border-border-subtle flex h-8 items-center gap-1 border pr-2 pl-3 text-sm leading-none font-normal whitespace-nowrap",
          open ? "rounded-t-lg rounded-b-none" : "rounded-lg",
          disabled
            ? "bg-surface-app text-ink-muted cursor-not-allowed select-none"
            : "hover:bg-surface-card active:bg-surface-subtle cursor-pointer",
        )}
      >
        <span>{selected}</span>
        <Image
          src="/icons/arrow-down.svg"
          width={20}
          height={20}
          alt=""
          aria-hidden="true"
          className={cn(
            "transition-transform",
            open && "rotate-180",
            disabled && "opacity-40",
          )}
        />
      </button>

      {open && !disabled && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="border-border-subtle absolute top-full left-0 z-20 min-w-full overflow-hidden rounded-b-lg border border-t-0 bg-white"
        >
          {availableOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className={cn(
                "text-ink-strong hover:bg-surface-card active:bg-surface-subtle flex h-8 w-full cursor-pointer items-center bg-white px-3 text-left text-sm",
                index > 0 && "border-border-subtle border-t",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
