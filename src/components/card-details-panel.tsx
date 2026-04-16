"use client";

import { CloseIconButton } from "@/components/ui/close-icon-button";
import { Panel } from "@/components/ui/panel";
import { UnfreezeRequestForm } from "@/components/unfreeze-request-form";
import { maskCardFull, maskIban } from "@/lib/card-mask";
import { Card, CardStatus } from "@/types";
const CARD_STATUS_UK: Record<CardStatus, string> = {
  PENDING: "На розгляді",
  ACTIVE: "Активна",
  REJECTED: "Відхилена",
  FROZEN: "Призупинена",
};
interface CardDetailsPanelProps {
  card: Card;
  onCopy: (text: string, label: string) => void;
  onDeselect: () => void;
  onUnfreezeRequestSuccess?: () => void;
}
const CopyRow = ({
  label,
  display,
  copyText,
  copyLabel,
  onCopy,
}: {
  label: string;
  display: string;
  copyText: string;
  copyLabel: string;
  onCopy: (text: string, label: string) => void;
}) => (
  <div className="flex items-center justify-between gap-4 self-stretch">
    <span className="text-ink-strong shrink-0 text-sm">{label}</span>
    <button
      type="button"
      onClick={() => onCopy(copyText, copyLabel)}
      title="Натисніть, щоб скопіювати"
      className="text-ink-strong cursor-pointer truncate border-none bg-transparent p-0 text-right font-mono text-sm transition-colors outline-none hover:text-black"
    >
      {display}
    </button>
  </div>
);
export const CardDetailsPanel = ({
  card,
  onCopy,
  onDeselect,
  onUnfreezeRequestSuccess,
}: CardDetailsPanelProps) => (
  <Panel
    as="section"
    aria-label="Деталі картки"
    className="flex flex-col gap-3 self-stretch p-4 text-sm"
  >
    <div className="flex items-center justify-between gap-4 self-stretch">
      <h2 className="text-ink-strong m-0 text-base font-medium">{card.name}</h2>
      <CloseIconButton
        onClick={onDeselect}
        aria-label="Закрити деталі картки"
      />
    </div>

    {card.cardNumber && (
      <CopyRow
        label="Номер картки"
        display={maskCardFull(card.cardNumber)}
        copyText={card.cardNumber}
        copyLabel="Номер картки скопійовано"
        onCopy={onCopy}
      />
    )}

    {card.iban && (
      <CopyRow
        label="IBAN"
        display={maskIban(card.iban)}
        copyText={card.iban}
        copyLabel="IBAN скопійовано"
        onCopy={onCopy}
      />
    )}

    <div className="flex items-center justify-between gap-4 self-stretch">
      <span className="text-ink-strong shrink-0 text-sm">Статус</span>
      <span className="text-ink-strong text-right text-sm font-medium">
        {CARD_STATUS_UK[card.status]}
      </span>
    </div>

    <div className="flex items-center justify-between gap-4 self-stretch">
      <span className="text-ink-strong text-sm">Баланс</span>
      <span className="text-ink-strong text-sm font-medium">
        {card.balance.toLocaleString("uk-UA", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        {card.currency}
      </span>
    </div>

    {card.status === "FROZEN" && !card.unfreezeRequestedAt && (
      <UnfreezeRequestForm
        cardId={card.id}
        onSuccess={onUnfreezeRequestSuccess}
      />
    )}
  </Panel>
);
