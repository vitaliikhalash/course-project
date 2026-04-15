import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
const secondaryButtonClassName =
  "inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-ink-muted bg-surface-subtle p-2 text-ink-strong text-sm font-normal leading-none outline-none transition-colors hover:bg-surface-pressed disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-disabled-light-bg disabled:text-disabled-light-text disabled:hover:bg-disabled-light-bg";
export const SecondaryButton = ({
  type = "button",
  className = "",
  children,
  ...props
}: SecondaryButtonProps) => (
  <button
    type={type}
    className={cn(secondaryButtonClassName, className)}
    {...props}
  >
    {children}
  </button>
);
