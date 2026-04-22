"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { ProfileEditModal } from "@/components/profile-edit-modal";
import { CloseIconButton } from "@/components/ui/close-icon-button";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { getProfile, type ProfileData } from "@/lib/actions/profile";
import { cn } from "@/lib/cn";
interface ProfileSidebarProps {
  open: boolean;
  onClose: () => void;
}
const buildDisplayName = (profile: ProfileData): string => {
  const full = [profile.firstName, profile.lastName]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .trim();
  return full || profile.email;
};
const buildInitial = (profile: ProfileData): string => {
  const source = profile.firstName?.[0] || profile.email[0] || "U";
  return source.toUpperCase();
};
const SidebarBody = ({
  profile,
  onEdit,
  onSignOut,
}: {
  profile: ProfileData;
  onEdit: () => void;
  onSignOut: () => void;
}) => {
  const displayName = buildDisplayName(profile);
  const initial = buildInitial(profile);
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
      <div className="flex items-center gap-3">
        <div className="bg-ink-bold flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
          <span className="font-montserrat text-2xl leading-none text-white uppercase">
            {initial}
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-ink-strong text-base font-semibold break-words">
            {displayName}
          </span>
          <span className="text-ink-muted text-sm break-words">
            {profile.phoneNumber || "—"}
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <PrimaryButton
          type="button"
          onClick={onEdit}
          className="w-full"
        >
          Редагувати профіль
        </PrimaryButton>

        <SecondaryButton
          type="button"
          onClick={onSignOut}
          className="w-full"
        >
          Вийти з акаунту
        </SecondaryButton>
      </div>
    </div>
  );
};
export const ProfileSidebar = ({ open, onClose }: ProfileSidebarProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getProfile();
        if (!cancelled) setProfile(data);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  const handleSignOut = useCallback(() => {
    signOut({
      callbackUrl: "/",
    });
  }, []);
  const handleSaved = useCallback((updated: ProfileData) => {
    setProfile(updated);
    setEditing(false);
  }, []);
  const backdropVisibility = open
    ? "opacity-100"
    : "pointer-events-none opacity-0";
  const panelTransform = open ? "translate-x-0" : "translate-x-full";
  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300",
          backdropVisibility,
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Профіль"
        className={cn(
          "bg-surface-card fixed inset-y-0 right-0 z-[61] flex w-full max-w-full flex-col shadow-2xl transition-transform duration-300 ease-in-out md:max-w-[24rem]",
          panelTransform,
        )}
      >
        <div className="border-border-subtle flex shrink-0 items-center justify-between border-b px-6 py-4">
          <span className="text-ink-strong text-base font-medium">Профіль</span>
          <CloseIconButton
            onClick={onClose}
            aria-label="Закрити"
            className="text-ink-placeholder"
          />
        </div>

        {profile && (
          <SidebarBody
            profile={profile}
            onEdit={() => setEditing(true)}
            onSignOut={handleSignOut}
          />
        )}
      </aside>

      {editing && profile && (
        <ProfileEditModal
          initial={profile}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
};
