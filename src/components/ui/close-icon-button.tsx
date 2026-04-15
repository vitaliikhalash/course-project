import Image from "next/image";
import { ButtonHTMLAttributes } from "react";
type CloseIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
export const CloseIconButton = ({
  type = "button",
  className = "",
  ...props
}: CloseIconButtonProps) => (
  <button
    type={type}
    className={`flex h-6 w-6 cursor-pointer items-center justify-center border-none bg-transparent p-0 outline-none disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    <Image
      src="/icons/close.svg"
      width={20}
      height={20}
      alt=""
      className="block"
      aria-hidden
    />
  </button>
);
