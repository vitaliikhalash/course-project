"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { ModalHeader } from "@/components/ui/modal-header";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}
export const LoginModal = ({
  onClose,
  onSwitchToRegister,
}: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Невірний логін або пароль");
    } else {
      onClose();
      router.refresh();
    }
  };
  return (
    <ModalOverlay
      role="dialog"
      aria-modal={true}
      aria-labelledby="login-title"
      onBackdropClick={onClose}
    >
      <ModalHeader
        id="login-title"
        title="Увійдіть до свого облікового запису"
        subtitle="З поверненням! Будь ласка, введіть свої дані."
      />

      <div className="flex flex-col items-start gap-3 self-stretch">
        <FormField
          id="login-email"
          label="Електронна адреса"
          type="email"
          placeholder="Введіть електронну адресу"
          value={email}
          hasError={Boolean(error)}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormField
          id="login-password"
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
          {loading ? "Вхід..." : "Увійти"}
        </PrimaryButton>
        <SecondaryButton onClick={onSwitchToRegister} className="self-stretch">
          Зареєструватися
        </SecondaryButton>
      </div>
    </ModalOverlay>
  );
};
