import { ButtonHTMLAttributes } from "react";
type TextLinkProps = ButtonHTMLAttributes<HTMLButtonElement>;
export const TextLink = ({
  type = "button",
  className = "",
  children,
  ...props
}: TextLinkProps) => (
  <button
    type={type}
    className={`text-ink-strong cursor-pointer border-none bg-transparent p-0 text-sm underline outline-none disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);
