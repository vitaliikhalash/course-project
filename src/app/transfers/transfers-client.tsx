"use client";

import { useCallback, useMemo, useState } from "react";
import { CardPicker } from "@/components/card-picker";
import { ConfirmModal } from "@/components/confirm-modal";
import { SuccessModal } from "@/components/success-modal";
import { TransactionHistory } from "@/components/transaction-history";
import { ErrorMessage } from "@/components/ui/error-message";
import { Panel } from "@/components/ui/panel";
import { PrimaryButton } from "@/components/ui/primary-button";
import { TextInput } from "@/components/ui/text-input";
import { TextLink } from "@/components/ui/text-link";
import { useTransferForm } from "@/hooks/use-transfer-form";
import { exportTransactionsXls } from "@/lib/export-xls";
import {
  SerializedCard,
  SerializedTransaction,
  toCard,
  toTransaction,
} from "@/types";
import { Transaction } from "@/types";
interface TransfersClientProps {
  initialCards: SerializedCard[];
  initialTransactions: SerializedTransaction[];
  isAuthenticated?: boolean;
}
const TRANSFER_PLACEHOLDER = "Немає карток для переказу";
function filterTransactionsByDate(
  list: Transaction[],
  dateFrom: string,
  dateTo: string,
) {
  return list.filter((tx) => {
    if (dateFrom && tx.dateKey < dateFrom) return false;
    if (dateTo && tx.dateKey > dateTo) return false;
    return true;
  });
}
function TransfersEmptyPanels({
  filteredTransactions,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearDateFilter,
}: {
  filteredTransactions: Transaction[];
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onClearDateFilter: () => void;
}) {
  return (
    <main className="max-w-content mb-auto flex w-full flex-col items-start gap-4 px-4">
      <Panel
        as="section"
        aria-labelledby="transfer-heading"
        className="flex flex-col items-start gap-4 self-stretch p-4 text-sm"
      >
        <h1
          id="transfer-heading"
          className="text-ink-strong m-0 text-base font-medium"
        >
          Переказ коштів
        </h1>
        <div className="flex w-full flex-col items-center">
          <p className="text-ink-placeholder m-0 w-full max-w-[26rem] py-8 text-center text-sm">
            {TRANSFER_PLACEHOLDER}
          </p>
        </div>
      </Panel>
      <TransactionHistory
        transactions={filteredTransactions}
        onExportXLS={() => exportTransactionsXls(filteredTransactions)}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
        onClearDateFilter={onClearDateFilter}
        className="items-stretch self-stretch text-sm"
      />
    </main>
  );
}
function TransfersFormInner({
  initialCards,
  filteredTransactions,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearDateFilter,
}: {
  initialCards: SerializedCard[];
  filteredTransactions: Transaction[];
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onClearDateFilter: () => void;
}) {
  const allResolved = useMemo(() => initialCards.map(toCard), [initialCards]);
  const sourcePickerCards = useMemo(() => {
    const list = allResolved.filter(
      (c) => c.status === "ACTIVE" || c.status === "FROZEN",
    );
    return [...list].sort((a, b) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      return 0;
    });
  }, [allResolved]);
  const destPickerCards = useMemo(() => {
    const list = allResolved.filter(
      (c) => c.status === "ACTIVE" || c.status === "FROZEN",
    );
    return [...list].sort((a, b) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      return 0;
    });
  }, [allResolved]);
  const {
    sourceCard,
    setSourceCard,
    destCard,
    setDestCard,
    targetType,
    setTargetType,
    externalCard,
    setExternalCard,
    amount,
    setAmount,
    amountError,
    cardError,
    showConfirm,
    isSubmitting,
    successMsg,
    setSuccessMsg,
    showSourcePicker,
    setShowSourcePicker,
    showDestPicker,
    setShowDestPicker,
    hasOwnTargetOptions,
    handleSubmitClick,
    handleConfirm,
    handleCancelConfirm,
  } = useTransferForm(sourcePickerCards, destPickerCards);
  const targetSwitchLabel =
    targetType === "own" ? "Інша картка" : "Картка зі списку";
  const sourceLocked = !sourceCard || sourceCard.status !== "ACTIVE";
  return (
    <>
      <main className="max-w-content mb-auto flex w-full flex-col items-start gap-4 px-4">
        <Panel
          as="section"
          aria-labelledby="transfer-heading"
          className="flex flex-col items-start gap-4 self-stretch p-4 text-sm"
        >
          <h1
            id="transfer-heading"
            className="text-ink-strong m-0 text-base font-medium"
          >
            Переказ коштів
          </h1>
          <div className="flex flex-col items-center self-stretch">
            <div className="flex w-full max-w-[26rem] flex-col items-center gap-4">
              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full flex-col gap-2">
                  <div className="text-ink-strong text-sm">З картки</div>
                  <CardPicker
                    cards={sourcePickerCards}
                    isItemDisabled={(c) => c.status === "FROZEN"}
                    selected={sourceCard}
                    onSelect={setSourceCard}
                    isOpen={showSourcePicker}
                    onOpen={() => setShowSourcePicker(true)}
                    onClose={() => setShowSourcePicker(false)}
                    label="Обрати картку відправника"
                  />
                </div>

                <div className="flex w-full flex-col gap-2">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-ink-strong text-sm">На картку</span>
                    {hasOwnTargetOptions && (
                      <TextLink
                        onClick={() =>
                          setTargetType(
                            targetType === "own" ? "external" : "own",
                          )
                        }
                      >
                        {targetSwitchLabel}
                      </TextLink>
                    )}
                  </div>
                  {targetType === "own" ? (
                    <CardPicker
                      cards={destPickerCards}
                      isItemDisabled={(c) => c.status === "FROZEN"}
                      selected={destCard}
                      onSelect={setDestCard}
                      isOpen={showDestPicker}
                      onOpen={() => setShowDestPicker(true)}
                      onClose={() => setShowDestPicker(false)}
                      label="Обрати картку отримувача"
                    />
                  ) : (
                    <TextInput
                      id="external-card"
                      type="text"
                      inputMode="text"
                      placeholder="Номер картки або IBAN"
                      value={externalCard}
                      hasError={Boolean(cardError)}
                      onChange={(e) => setExternalCard(e.target.value)}
                      maxLength={29}
                      aria-label="Номер картки або IBAN"
                      aria-describedby={cardError ? "card-error" : undefined}
                    />
                  )}
                  {cardError && (
                    <ErrorMessage id="card-error" message={cardError} />
                  )}
                </div>

                <div className="flex w-full flex-col gap-2">
                  <label
                    htmlFor="transfer-amount"
                    className="text-ink-strong text-sm"
                  >
                    Сума
                  </label>
                  <div className="flex w-full items-center gap-2">
                    <TextInput
                      id="transfer-amount"
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                      placeholder="1000"
                      value={amount}
                      hasError={Boolean(amountError)}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1"
                      aria-label="Сума переказу в гривнях"
                    />

                    <span className="text-ink-strong shrink-0 text-sm font-medium">
                      UAH
                    </span>
                  </div>
                  {amountError && <ErrorMessage message={amountError} />}
                </div>
              </div>

              <PrimaryButton
                onClick={handleSubmitClick}
                disabled={isSubmitting || sourceLocked}
                aria-busy={isSubmitting}
                className="w-auto self-center"
              >
                {isSubmitting ? "Обробка…" : "Переказати кошти"}
              </PrimaryButton>
            </div>
          </div>
        </Panel>
        <TransactionHistory
          transactions={filteredTransactions}
          onExportXLS={() => exportTransactionsXls(filteredTransactions)}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
          onClearDateFilter={onClearDateFilter}
          className="items-stretch self-stretch text-sm"
        />
      </main>
      {showConfirm && (
        <ConfirmModal
          sourceCard={sourceCard}
          targetType={targetType}
          destCard={destCard}
          externalCard={externalCard}
          amount={amount}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
          isSubmitting={isSubmitting}
        />
      )}
      {successMsg && (
        <SuccessModal message={successMsg} onClose={() => setSuccessMsg("")} />
      )}
    </>
  );
}
export default function TransfersClient({
  initialCards,
  initialTransactions,
  isAuthenticated = true,
}: TransfersClientProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const allCards = useMemo(() => initialCards.map(toCard), [initialCards]);
  const activeCards = useMemo(
    () => allCards.filter((c) => c.status === "ACTIVE"),
    [allCards],
  );
  const transactions = useMemo(
    () => initialTransactions.map(toTransaction),
    [initialTransactions],
  );
  const filteredTransactions = useMemo(
    () => filterTransactionsByDate(transactions, dateFrom, dateTo),
    [transactions, dateFrom, dateTo],
  );
  const clearDateFilter = useCallback(() => {
    setDateFrom("");
    setDateTo("");
  }, []);
  const canTransfer = isAuthenticated && activeCards.length > 0;
  const historyDateProps = {
    dateFrom,
    dateTo,
    onDateFromChange: setDateFrom,
    onDateToChange: setDateTo,
    onClearDateFilter: clearDateFilter,
  } as const;
  if (!canTransfer) {
    return (
      <TransfersEmptyPanels
        filteredTransactions={filteredTransactions}
        {...historyDateProps}
      />
    );
  }
  return (
    <TransfersFormInner
      initialCards={initialCards}
      filteredTransactions={filteredTransactions}
      {...historyDateProps}
    />
  );
}
