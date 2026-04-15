import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export const primaryButtonClassName =
  "inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-ink-bold bg-ink-bold p-2 text-sm font-normal leading-none text-white outline-none transition-colors hover:bg-ink-strong disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-disabled-dark-bg disabled:text-disabled-dark-text disabled:hover:bg-disabled-dark-bg";
export const PrimaryButton = ({
  type = "button",
  className = "",
  children,
  ...props
}: PrimaryButtonProps) => (
  <button
    type={type}
    className={cn(primaryButtonClassName, className)}
    {...props}
  >
    {children}
  </button>
);
