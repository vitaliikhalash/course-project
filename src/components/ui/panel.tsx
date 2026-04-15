import { HTMLAttributes } from "react";
interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "aside";
}
export const Panel = ({ as = "div", className = "", ...props }: PanelProps) => {
  const base = `box-border rounded-lg border border-border-subtle bg-surface-card overflow-hidden ${className}`;
  if (as === "section") return <section className={base} {...props} />;
  if (as === "article") return <article className={base} {...props} />;
  if (as === "aside") return <aside className={base} {...props} />;
  return <div className={base} {...props} />;
};
