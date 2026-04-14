import Link from "next/link";
import { primaryButtonClassName } from "@/components/ui/primary-button";
export const metadata = {
  title: "Доступ заборонено",
};
export default function UnauthorizedPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="border-border-subtle bg-surface-card flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="leading-prose text-ink-strong m-0 text-2xl font-semibold tracking-[-0.02em]">
            403
          </p>
          <h1 className="text-ink-strong m-0 text-base font-medium">
            Доступ заборонено
          </h1>
        </div>
        <p className="text-ink-strong m-0 text-sm leading-normal">
          У вас немає прав для перегляду цієї сторінки.
        </p>
        <Link
          href="/"
          className={`${primaryButtonClassName} px-6 py-2.5 text-sm no-underline`}
        >
          На головну
        </Link>
      </div>
    </main>
  );
}
