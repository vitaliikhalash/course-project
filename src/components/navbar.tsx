"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LoginModal } from "@/components/login-modal";
import { ProfileSidebar } from "@/components/profile-sidebar";
import { RegisterModal } from "@/components/register-modal";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
const NAV_LINKS = [
  {
    href: "/wallet",
    label: "Гаманець",
  },
  {
    href: "/transfers",
    label: "Перекази",
  },
] as const;
type ModalState = "none" | "login" | "register";
const BURGER_LINE_BASE =
  "absolute block w-full h-0.5 bg-ink-strong transition-all";
export const Navbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>("none");
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => {
    if (searchParams.get("modal") === "login") {
      const timer = setTimeout(() => {
        setModal("login");
        router.replace(pathname, {
          scroll: false,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, pathname, router]);
  const userInitial =
    session?.user?.name?.[0] || session?.user?.email?.[0] || "U";
  const burgerTopClass = isOpen ? "rotate-45" : "-translate-y-[0.35rem]";
  const burgerMiddleClass = isOpen ? "opacity-0" : "";
  const burgerBottomClass = isOpen ? "-rotate-45" : "translate-y-[0.35rem]";
  return (
    <>
      <div className="z-50 flex items-start self-stretch">
        <div className="border-border-subtle bg-surface-card box-border flex w-full flex-col items-center overflow-hidden border-b">
          <div className="max-w-content flex h-[4.5rem] w-full items-center gap-6 px-4">
            <Link
              href="/"
              aria-label="Перейти на головну сторінку MINIBANK"
              className="text-ink-strong flex w-[6.75rem] shrink-0 cursor-pointer items-center justify-center overflow-hidden no-underline"
            >
              <b className="relative inline-block w-[6.75rem] shrink-0 tracking-[-0.02em]">
                MINIBANK
              </b>
            </Link>
            <nav
              className="flex min-w-0 flex-1 items-center justify-end gap-2 text-sm sm:gap-3.5 sm:text-base"
              aria-label="Основна навігація"
            >
              <div className="hidden min-w-0 items-center gap-2 sm:gap-3.5 md:flex">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={pathname === href ? "page" : undefined}
                    className="text-ink-strong flex cursor-pointer items-center justify-center overflow-hidden p-2 no-underline"
                  >
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              <div className="hidden items-center justify-center gap-2 md:flex">
                {status === "loading" ? (
                  <div className="bg-border-subtle h-10 w-10 animate-pulse rounded-full" />
                ) : session ? (
                  <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className="bg-ink-bold hover:bg-ink-strong flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none transition-colors"
                    title="Профіль"
                    aria-label="Відкрити профіль"
                  >
                    <span className="font-montserrat text-surface-card inline-block h-6 w-5 text-center text-xl leading-[1.2] uppercase">
                      {userInitial}
                    </span>
                  </button>
                ) : (
                  <div className="flex max-w-full min-w-0 items-center justify-end gap-1.5 sm:gap-2">
                    <PrimaryButton
                      type="button"
                      onClick={() => setModal("register")}
                      className="max-w-full min-w-0 flex-1 basis-0"
                    >
                      <span className="min-w-0 truncate">Реєстрація</span>
                    </PrimaryButton>
                    <SecondaryButton
                      type="button"
                      onClick={() => setModal("login")}
                      className="shrink-0 whitespace-nowrap"
                    >
                      Вхід
                    </SecondaryButton>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
                aria-expanded={isOpen}
                className="relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent md:hidden"
              >
                <span className={`${BURGER_LINE_BASE} ${burgerTopClass}`} />
                <span className={`${BURGER_LINE_BASE} ${burgerMiddleClass}`} />
                <span className={`${BURGER_LINE_BASE} ${burgerBottomClass}`} />
              </button>
            </nav>
          </div>

          {isOpen && (
            <div className="border-border-subtle flex w-full flex-col items-start gap-4 border-t px-4 py-4 text-base md:hidden">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="text-ink-strong flex w-full cursor-pointer items-center no-underline"
                >
                  {label}
                </Link>
              ))}
              <div className="flex min-w-0 items-center gap-2 self-stretch sm:gap-4">
                {session ? (
                  <SecondaryButton
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setProfileOpen(true);
                    }}
                    className="w-full"
                  >
                    Профіль
                  </SecondaryButton>
                ) : (
                  <>
                    <PrimaryButton
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setModal("register");
                      }}
                      className="max-w-full min-w-0 flex-1 basis-0"
                    >
                      <span className="min-w-0 truncate">Реєстрація</span>
                    </PrimaryButton>
                    <SecondaryButton
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setModal("login");
                      }}
                      className="shrink-0 whitespace-nowrap"
                    >
                      Вхід
                    </SecondaryButton>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal === "login" && (
        <LoginModal
          onClose={() => setModal("none")}
          onSwitchToRegister={() => setModal("register")}
        />
      )}
      {modal === "register" && (
        <RegisterModal
          onClose={() => setModal("none")}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
      <ProfileSidebar
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
};
