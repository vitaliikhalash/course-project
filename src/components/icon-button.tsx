import Image from "next/image";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  alt?: string;
  iconSize?: number;
}

export const IconButton = ({
  icon,
  alt = "",
  iconSize = 20,
  className = "",
  ...props
}: IconButtonProps) => (
  <button
    {...props}
    className={cn(
      "rounded-num-5 bg-surface-subtle hover:bg-surface-pressed disabled:bg-disabled-bg disabled:hover:bg-disabled-bg flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border-none disabled:cursor-not-allowed",
      className,
    )}
  >
    <div className="pointer-events-none relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden">
      <Image
        src={icon}
        width={iconSize}
        height={iconSize}
        alt={alt}
        aria-hidden={!alt}
        className={cn(
          "cursor-inherit pointer-events-none",
          props.disabled && "opacity-40",
        )}
      />
    </div>
  </button>
);
