import { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
interface ModalOverlayProps extends HTMLAttributes<HTMLDivElement> {
  onBackdropClick?: () => void;
  panelClassName?: string;
  children: ReactNode;
}
export const ModalOverlay = ({
  onBackdropClick,
  panelClassName = "",
  children,
  ...ariaProps
}: ModalOverlayProps) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
    onClick={onBackdropClick}
    {...ariaProps}
  >
    <div
      className={cn(
        "border-border-subtle bg-surface-card font-montserrat text-ink-strong relative box-border flex w-full max-w-[24rem] flex-col items-center gap-4 rounded-lg border p-6 text-left text-base",
        panelClassName,
      )}
      onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);
