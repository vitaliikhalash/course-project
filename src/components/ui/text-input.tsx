import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}
export const TextInput = ({
  className = "",
  hasError = false,
  ...props
}: TextInputProps) => {
  const borderClass = hasError ? "border-danger" : "border-border-subtle";
  return (
    <input
      className={cn(
        "text-ink-strong placeholder:text-ink-placeholder box-border w-full rounded-lg border bg-white p-3 text-sm outline-none disabled:cursor-not-allowed",
        borderClass,
        className,
      )}
      {...props}
    />
  );
};
