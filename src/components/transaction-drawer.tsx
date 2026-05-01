"use client";

import { useCallback, useEffect, useState } from "react";
import { CloseIconButton } from "@/components/ui/close-icon-button";
import { Toast } from "@/components/ui/toast";
import { maskCardFull, maskIban } from "@/lib/card-mask";
import { cn } from "@/lib/cn";
import { Transaction } from "@/types";
const STATUS_CFG: Record<
  string,
  {
    label: string;
    cls: string;
  }
> = {
  COMPLETED: {
    label: "Виконано",
    cls: "text-success",
  },
  PENDING: {
    label: "В обробці",
    cls: "text-yellow-500",
  },
  FAILED: {
    label: "Помилка",
    cls: "text-danger",
  },
};
const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-ink-strong text-[0.6875rem] font-medium tracking-wider uppercase">
      {label}
    </span>
    {children}
  </div>
);
const CopyValue = ({
  display,
  copyText,
  copyLabel,
  onCopy,
}: {
  display: string;
  copyText: string;
  copyLabel: string;
  onCopy: (text: string, label: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onCopy(copyText, copyLabel)}
    title="Натисніть, щоб скопіювати"
    className="text-ink-strong cursor-pointer border-none bg-transparent p-0 text-left font-mono text-sm break-all transition-colors outline-none hover:text-black"
  >
    {display}
  </button>
);
const DrawerContent = ({
  tx,
  onClose,
  onCopy,
}: {
  tx: Transaction;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
}) => {
  const status = STATUS_CFG[tx.status] ?? {
    label: tx.status,
    cls: "text-ink-strong",
  };
  const cpLabel = tx.isOutgoing ? "Отримувач" : "Відправник";
  const hasCounterparty = tx.counterpartyCardNumber || tx.counterpartyIban;
  const amountColor = tx.isOutgoing ? "text-danger" : "text-success";
  return (
    <div className="flex h-full flex-col">
      <div className="border-border-subtle flex shrink-0 items-center justify-between border-b px-6 py-4">
        <span className="text-ink-strong text-base font-medium">
          Деталі транзакції
        </span>
        <CloseIconButton
          onClick={onClose}
          aria-label="Закрити"
          className="text-ink-placeholder"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-border-subtle border-b px-6 py-8 text-center">
          <p
            className={cn(
              "m-0 text-[2rem] leading-none font-semibold",
              amountColor,
            )}
          >
            {tx.amount}
          </p>
          <p className={cn("m-0 mt-2 text-sm font-medium", status.cls)}>
            {status.label}
          </p>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <InfoRow label="Опис">
            <span className="text-ink-strong text-sm">{tx.name}</span>
          </InfoRow>

          <InfoRow label="Дата і час">
            <span className="text-ink-strong text-sm">{tx.time}</span>
          </InfoRow>

          <InfoRow label="ID транзакції">
            <CopyValue
              display={`${tx.id.slice(0, 12)}…${tx.id.slice(-6)}`}
              copyText={tx.id}
              copyLabel="ID транзакції скопійовано"
              onCopy={onCopy}
            />
          </InfoRow>

          {tx.balanceAfter !== null && (
            <InfoRow label="Баланс після">
              <span className="text-ink-strong text-sm font-medium">
                {tx.balanceAfter.toLocaleString("uk-UA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                грн
              </span>
            </InfoRow>
          )}
        </div>

        {hasCounterparty && (
          <div className="border-border-subtle flex flex-col gap-5 border-t px-6 py-6">
            <p className="text-ink-placeholder m-0 text-xs font-semibold tracking-wider uppercase">
              {cpLabel}
            </p>

            {tx.counterpartyCardNumber && (
              <InfoRow label="Номер картки">
                <CopyValue
                  display={maskCardFull(tx.counterpartyCardNumber)}
                  copyText={tx.counterpartyCardNumber}
                  copyLabel="Номер картки скопійовано"
                  onCopy={onCopy}
                />
              </InfoRow>
            )}

            {tx.counterpartyIban && (
              <InfoRow label="IBAN">
                <CopyValue
                  display={maskIban(tx.counterpartyIban)}
                  copyText={tx.counterpartyIban}
                  copyLabel="IBAN скопійовано"
                  onCopy={onCopy}
                />
              </InfoRow>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
}
export const TransactionDrawer = ({
  transaction,
  onClose,
}: TransactionDrawerProps) => {
  const isOpen = transaction !== null;
  const [displayTx, setDisplayTx] = useState<Transaction | null>(null);
  useEffect(() => {
    if (transaction) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- keep last tx during close animation
      setDisplayTx(transaction);
    }
  }, [transaction]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const [toastMsg, setToastMsg] = useState("");
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMsg(label);
    } catch {}
  };
  const handleDismissToast = useCallback(() => setToastMsg(""), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);
  const backdropVisibility = isOpen
    ? "opacity-100"
    : "pointer-events-none opacity-0";
  const panelTransform = isOpen ? "translate-x-0" : "translate-x-full";
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
        aria-label="Деталі транзакції"
        className={cn(
          "fixed inset-y-0 right-0 z-[61] flex w-full max-w-full flex-col bg-white transition-transform duration-300 ease-in-out md:max-w-[24rem]",
          panelTransform,
        )}
      >
        {displayTx && (
          <DrawerContent tx={displayTx} onClose={onClose} onCopy={handleCopy} />
        )}
      </aside>

      {toastMsg && <Toast message={toastMsg} onDismiss={handleDismissToast} />}
    </>
  );
};
