"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconButton } from "@/components/icon-button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Panel } from "@/components/ui/panel";
export const QuickTransfer = () => {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [cardError, setCardError] = useState("");
  const handleSubmit = () => {
    const trimmed = cardNumber.trim();
    if (!trimmed) {
      router.push("/transfers?external=1");
      return;
    }
    const cleaned = trimmed.replace(/\s/g, "");
    if (/^\d{16,19}$/.test(cleaned)) {
      setCardError("");
      router.push(`/transfers?target=${cleaned}`);
    } else {
      setCardError("Введіть коректний номер картки");
    }
  };
  const inputBorder = cardError ? "border-danger" : "border-border-subtle";
  return (
    <Panel
      as="section"
      aria-labelledby="quick-transfer-heading"
      className="text-ink-strong flex flex-col items-start gap-4 self-stretch p-4 text-base"
    >
      <div id="quick-transfer-heading" className="font-medium">
        Переказати на картку
      </div>
      <div className="flex flex-col items-start justify-center gap-2 self-stretch">
        <div className="flex items-center gap-2 self-stretch">
          <label htmlFor="quick-card-number" className="sr-only">
            Номер картки
          </label>
          <input
            id="quick-card-number"
            type="text"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            value={cardNumber}
            onChange={(e) => {
              setCardNumber(e.target.value);
              if (cardError) setCardError("");
            }}
            className={`placeholder:text-ink-placeholder box-border min-w-0 flex-1 self-stretch rounded-lg border bg-white p-3 leading-none outline-none ${inputBorder}`}
          />

          <IconButton
            icon="/icons/arrow-right.svg"
            onClick={handleSubmit}
            aria-label="Перейти або перевірити картку"
          />
        </div>
        {cardError && <ErrorMessage message={cardError} />}
        <div className="text-ink-strong text-sm">VISA/MasterCard</div>
      </div>
    </Panel>
  );
};
