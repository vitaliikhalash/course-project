"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { ModalHeader } from "@/components/ui/modal-header";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { type ProfileData, updateProfile } from "@/lib/actions/profile";
interface ProfileEditModalProps {
  initial: ProfileData;
  onClose: () => void;
  onSaved: (profile: ProfileData) => void;
}
export const ProfileEditModal = ({
  initial,
  onClose,
  onSaved,
}: ProfileEditModalProps) => {
  const { update } = useSession();
  const [firstName, setFirstName] = useState(initial.firstName ?? "");
  const [lastName, setLastName] = useState(initial.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initial.phoneNumber ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phoneNumber", phoneNumber);
    const result = await updateProfile(formData);
    setLoading(false);
    if (!result.success || !result.profile) {
      setError(result.error ?? "Не вдалося зберегти профіль");
      return;
    }
    const displayName = [result.profile.firstName, result.profile.lastName]
      .filter((part): part is string => Boolean(part))
      .join(" ")
      .trim();
    await update({
      name: displayName || null,
    });
    onSaved(result.profile);
  };
  return (
    <ModalOverlay
      role="dialog"
      aria-modal={true}
      aria-labelledby="profile-edit-title"
      onBackdropClick={onClose}
    >
      <ModalHeader id="profile-edit-title" title="Редагувати профіль" />
      <div className="flex flex-col items-start gap-3 self-stretch">
        <FormField
          id="profile-first-name"
          label="Ім'я"
          type="text"
          placeholder="Введіть ім'я"
          value={firstName}
          hasError={Boolean(error)}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <FormField
          id="profile-last-name"
          label="Прізвище"
          type="text"
          placeholder="Введіть прізвище"
          value={lastName}
          hasError={Boolean(error)}
          onChange={(e) => setLastName(e.target.value)}
        />

        <FormField
          id="profile-phone"
          label="Телефон"
          type="tel"
          placeholder="+38 (000) 000 00 00"
          value={phoneNumber}
          hasError={Boolean(error)}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        {error && <ErrorMessage message={error} />}
      </div>
      <div className="flex flex-col items-start gap-3 self-stretch">
        <PrimaryButton
          disabled={loading}
          onClick={handleSubmit}
          className="self-stretch"
        >
          {loading ? "Збереження..." : "Зберегти"}
        </PrimaryButton>
        <SecondaryButton
          disabled={loading}
          onClick={onClose}
          className="self-stretch"
        >
          Скасувати
        </SecondaryButton>
      </div>
    </ModalOverlay>
  );
};
