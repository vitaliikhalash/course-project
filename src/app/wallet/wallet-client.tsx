"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { CardDetailsPanel } from "@/components/card-details-panel";
import { CardTile } from "@/components/card-tile";
import { IconButton } from "@/components/icon-button";
import { TransactionHistory } from "@/components/transaction-history";
import { Panel } from "@/components/ui/panel";
import { Toast } from "@/components/ui/toast";
import { exportTransactionsXls } from "@/lib/export-xls";
import {
  Card,
  SerializedCard,
  SerializedTransaction,
  toCard,
  toTransaction,
} from "@/types";
const CARD_QUERY = "card";
interface WalletClientProps {
  initialCards: SerializedCard[];
  initialTransactions: SerializedTransaction[];
}
function WalletClientInner({
  initialCards,
  initialTransactions,
}: WalletClientProps) {
  const cards = useMemo(
    () =>
      initialCards
        .map(toCard)
        .filter((c) => c.status !== "PENDING" && c.status !== "REJECTED"),
    [initialCards],
  );
  const transactions = useMemo(
    () => initialTransactions.map(toTransaction),
    [initialTransactions],
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [toastMsg, setToastMsg] = useState("");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const setCardQuery = useCallback(
    (id: string | null) => {
      const p = new URLSearchParams(searchParams.toString());
      if (id) p.set(CARD_QUERY, id);
      else p.delete(CARD_QUERY);
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams],
  );
  const cardIdFromUrl = searchParams.get(CARD_QUERY);
  useEffect(() => {
    if (!cardIdFromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL ?card= drives selection
      setSelectedCard(null);
      return;
    }
    const card = cards.find((c) => c.id === cardIdFromUrl);
    if (!card) {
      setCardQuery(null);
      return;
    }
    setSelectedCard(card);
  }, [cardIdFromUrl, cards, setCardQuery]);
  const handleSelectCard = (card: Card) => {
    if (cardIdFromUrl === card.id) {
      setCardQuery(null);
    } else {
      setCardQuery(card.id);
    }
  };
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMsg(label);
    } catch {}
  };
  const handleDismissToast = useCallback(() => setToastMsg(""), []);
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedCard) {
        const ownId = tx.isOutgoing ? tx.fromCardId : tx.toCardId;
        if (ownId !== selectedCard.id) return false;
      }
      if (dateFrom && tx.dateKey < dateFrom) return false;
      if (dateTo && tx.dateKey > dateTo) return false;
      return true;
    });
  }, [transactions, selectedCard, dateFrom, dateTo]);
  return (
    <>
      <main className="max-w-content mb-auto flex w-full flex-col gap-4 px-4 text-sm md:flex-row md:items-stretch">
        <Panel
          as="section"
          aria-labelledby="wallet-cards-heading"
          className="flex w-full flex-col items-center gap-4 p-4 md:w-[20.375rem] md:shrink-0 md:self-start"
        >
          <div className="flex items-start justify-between gap-5 self-stretch text-base">
            <h1
              id="wallet-cards-heading"
              className="text-ink-strong m-0 text-base font-medium"
            >
              Картки
            </h1>
            <IconButton
              icon="/icons/add.svg"
              aria-label="Подати заявку на нову картку"
              onClick={() => router.push("/wallet/add-card")}
            />
          </div>

          {cards.length > 0 ? (
            <div className="flex max-h-[34.5rem] flex-col gap-3 self-stretch overflow-y-auto">
              {cards.map((card) => (
                <CardTile
                  key={card.id}
                  card={card}
                  isSelected={selectedCard?.id === card.id}
                  onClick={() => handleSelectCard(card)}
                />
              ))}
            </div>
          ) : (
            <p className="text-ink-placeholder m-0 self-stretch py-8 text-center text-sm">
              Немає карток
            </p>
          )}
        </Panel>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {selectedCard && (
            <CardDetailsPanel
              card={selectedCard}
              onCopy={handleCopy}
              onDeselect={() => setCardQuery(null)}
              onUnfreezeRequestSuccess={() =>
                setToastMsg("Заявку на розмороження успішно подано")
              }
            />
          )}
          <TransactionHistory
            transactions={filteredTransactions}
            onExportXLS={() => exportTransactionsXls(filteredTransactions)}
            selectedCard={selectedCard}
            onClearCardFilter={() => setCardQuery(null)}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClearDateFilter={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="flex-1 items-center"
            paginationClassName="mt-auto"
          />
        </div>
      </main>

      {toastMsg && <Toast message={toastMsg} onDismiss={handleDismissToast} />}
    </>
  );
}
export default function WalletClient(props: WalletClientProps) {
  return (
    <Suspense fallback={null}>
      <WalletClientInner {...props} />
    </Suspense>
  );
}
