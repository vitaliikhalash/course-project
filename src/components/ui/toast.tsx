"use client";

import { useEffect } from "react";
interface ToastProps {
  message: string;
  onDismiss: () => void;
  variant?: "default" | "error";
  duration?: number;
}
const BG: Record<NonNullable<ToastProps["variant"]>, string> = {
  default: "bg-ink-strong",
  error: "bg-danger",
};
export const Toast = ({
  message,
  onDismiss,
  variant = "default",
  duration,
}: ToastProps) => {
  const ms = duration ?? (variant === "error" ? 4000 : 2000);
  useEffect(() => {
    const t = setTimeout(onDismiss, ms);
    return () => clearTimeout(t);
  }, [message, onDismiss, ms]);
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`pointer-events-none fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap text-white shadow-lg ${BG[variant]}`}
    >
      {message}
    </div>
  );
};
