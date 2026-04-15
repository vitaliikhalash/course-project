import Image from "next/image";
import Link, { LinkProps } from "next/link";
interface IconLinkProps extends LinkProps {
  icon: string;
  className?: string;
  "aria-label"?: string;
}
export const IconLink = ({ icon, className = "", ...props }: IconLinkProps) => (
  <Link
    className={`rounded-num-5 bg-surface-subtle hover:bg-surface-pressed flex h-6 w-6 cursor-pointer items-center justify-center ${className}`}
    {...props}
  >
    <div className="relative h-5 w-5 shrink-0 overflow-hidden">
      <Image
        src={icon}
        className="absolute max-h-full w-full max-w-full overflow-hidden"
        width={20}
        height={20}
        alt=""
        aria-hidden="true"
      />
    </div>
  </Link>
);
