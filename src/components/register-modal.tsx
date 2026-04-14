"use client";

import { useState } from "react";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { ModalHeader } from "@/components/ui/modal-header";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { registerUser } from "@/lib/actions/auth";
interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}
export const RegisterModal = ({
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phoneNumber", phoneNumber);
    formData.append("email", email);
    formData.append("password", password);
    const result = await registerUser(formData);
    setLoading(false);
    if (result.success) {
      onSwitchToLogin();
    } else {
      setError(result.error ?? "Помилка при реєстрації");
    }
  };
  return (
    <ModalOverlay
      role="dialog"
      aria-modal={true}
      aria-labelledby="register-title"
      onBackdropClick={onClose}
    >
      <ModalHeader
        id="register-title"
        title="Створення нового облікового запису"
        subtitle="Будь ласка, введіть свої дані."
      />

      <div className="flex flex-col items-start gap-3 self-stretch">
        <FormField
          id="register-first-name"
          label="Ім'я користувача"
          type="text"
          placeholder="Введіть ім'я користувача"
          value={firstName}
          hasError={Boolean(error)}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <FormField
          id="register-last-name"
          label="Прізвище користувача"
          type="text"
          placeholder="Введіть прізвище користувача"
          value={lastName}
          hasError={Boolean(error)}
          onChange={(e) => setLastName(e.target.value)}
        />

        <FormField
          id="register-phone"
          label="Номер телефону"
          type="tel"
          placeholder="Введіть номер телефону"
          value={phoneNumber}
          hasError={Boolean(error)}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <FormField
          id="register-email"
          label="Електронна адреса"
          type="email"
          placeholder="Введіть електронну адресу"
          value={email}
          hasError={Boolean(error)}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormField
          id="register-password"
          label="Пароль"
          type="password"
          placeholder="Введіть пароль"
          value={password}
          hasError={Boolean(error)}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <ErrorMessage message={error} />}
      </div>
      <div className="flex flex-col items-start gap-3 self-stretch">
        <PrimaryButton
          disabled={loading}
          onClick={handleSubmit}
          className="self-stretch"
        >
          {loading ? "Завантаження..." : "Зареєструватися"}
        </PrimaryButton>
        <SecondaryButton onClick={onSwitchToLogin} className="self-stretch">
          Вже маєте акаунт? Увійти
        </SecondaryButton>
      </div>
    </ModalOverlay>
  );
};
