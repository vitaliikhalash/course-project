import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
type BadgeVariant = "subtle" | "success" | "danger";
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  subtle: "bg-surface-subtle text-ink-strong",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
};
export const Badge = ({
  variant = "subtle",
  className = "",
  children,
  ...props
}: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-lg px-3 py-1 text-sm",
      VARIANT_CLASSES[variant],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);
