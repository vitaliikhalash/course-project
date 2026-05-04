"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { CardStatus } from "@/types";
const CARD_STATUS_OPTIONS: CardStatus[] = [
  "PENDING",
  "ACTIVE",
  "REJECTED",
  "FROZEN",
];
interface CardStatusPickerProps {
  name: string;
  defaultValue: CardStatus;
  disabled?: boolean;
  ariaLabel: string;
}
export const CardStatusPicker = ({
  name,
  defaultValue,
  disabled = false,
  ariaLabel,
}: CardStatusPickerProps) => {
  const [selected, setSelected] = useState<CardStatus>(defaultValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const availableOptions = CARD_STATUS_OPTIONS.filter(
    (option) => option !== selected,
  );
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
    <div
      ref={rootRef}
      className={cn(
        "relative shrink-0",
        open &&
          !disabled &&
          "border-border-subtle z-20 overflow-hidden rounded-lg border bg-white",
      )}
    >
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 min-w-max items-center gap-1 pr-2 pl-3 text-sm leading-none font-normal whitespace-nowrap",
          open && !disabled
            ? "border-border-subtle w-full rounded-none border-0 border-b bg-white"
            : "border-border-subtle rounded-lg border",
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
          className="divide-border-subtle divide-y"
        >
          {availableOptions.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
              className="text-ink-strong hover:bg-surface-card active:bg-surface-subtle flex h-8 w-full cursor-pointer items-center bg-white px-3 text-left text-sm outline-none"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
