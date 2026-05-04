"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CardItem } from "@/components/card-item";
import { HeroSlider } from "@/components/hero-slider";
import { IconLink } from "@/components/icon-link";
import { PanelPagination } from "@/components/panel-pagination";
import { QuickTransfer } from "@/components/quick-transfer";
import { TransactionCard } from "@/components/transaction-card";
import { Panel } from "@/components/ui/panel";
import { PANEL_PAGE_SIZE } from "@/lib/pagination";
import { resolveDisplayName } from "@/lib/transaction-display";
import {
  SerializedCard,
  SerializedTransaction,
  toCard,
  toTransaction,
} from "@/types";
interface HomeClientProps {
  initialCards: SerializedCard[];
  initialTransactions: SerializedTransaction[];
}
const FOCUSABLE_LINK =
  "group self-stretch cursor-pointer rounded-lg outline-offset-2 no-underline text-inherit focus-visible:ring-2 focus-visible:ring-border-subtle";
export default function HomeClient({
  initialCards,
  initialTransactions,
}: HomeClientProps) {
  const [txPage, setTxPage] = useState(1);

  const activeCards = useMemo(
    () =>
      initialCards.map(toCard).filter((c) => c.status === "ACTIVE"),
    [initialCards],
  );
  const transactions = useMemo(
    () => initialTransactions.map(toTransaction),
    [initialTransactions],
  );

  const totalTxPages = Math.max(
    1,
    Math.ceil(transactions.length / PANEL_PAGE_SIZE),
  );
  const txPageClamped = Math.min(txPage, totalTxPages);
  const pagedHomeTransactions = useMemo(
    () =>
      transactions.slice(
        (txPageClamped - 1) * PANEL_PAGE_SIZE,
        txPageClamped * PANEL_PAGE_SIZE,
      ),
    [transactions, txPageClamped],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTxPage(1);
  }, [transactions]);

  return (
    <main className="max-w-content box-border flex w-full flex-col items-start gap-4 px-4 text-center text-5xl">
      <HeroSlider />
      <div className="text-ink-strong grid w-full grid-cols-1 gap-4 self-stretch text-left text-sm md:grid-cols-2">
        <div className="flex flex-col items-start gap-4">
          <Panel
            as="section"
            aria-labelledby="wallet-heading"
            className="flex flex-col items-start gap-4 self-stretch p-4"
          >
            <div className="text-ink-strong flex items-start justify-between gap-5 self-stretch text-base">
              <h2 id="wallet-heading" className="m-0 text-base font-medium">
                Гаманець
              </h2>
              <IconLink
                href="/wallet"
                icon="/icons/arrow-right.svg"
                aria-label="Відкрити параметри гаманця"
              />
            </div>
            {activeCards.length > 0 ? (
              <div className="flex max-h-[21.2rem] min-w-0 flex-col gap-3 self-stretch overflow-x-hidden overflow-y-auto">
                {activeCards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/wallet?card=${encodeURIComponent(card.id)}`}
                    className={`${FOCUSABLE_LINK} min-w-0`}
                  >
                    <CardItem card={card} interactive />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-ink-placeholder m-0 self-stretch py-8 text-center text-sm">
                Немає активних карток
              </p>
            )}
          </Panel>
          <QuickTransfer />
        </div>
        <div className="relative h-[30rem] w-full md:h-auto">
          <Panel
            as="section"
            aria-labelledby="tx-history-heading"
            className="absolute inset-0 flex flex-col items-start gap-4 p-4"
          >
            <div className="text-ink-strong flex shrink-0 items-start justify-between gap-5 self-stretch text-base">
              <h2 id="tx-history-heading" className="m-0 text-base font-medium">
                Історія транзакцій
              </h2>
              <IconLink
                href={
                  transactions.length === 0
                    ? "/transfers?external=1"
                    : "/transfers"
                }
                icon="/icons/arrow-right.svg"
                aria-label={
                  transactions.length === 0
                    ? "Відкрити сторінку переказів: переказ на зовнішню картку"
                    : "Відкрити сторінку переказів та повну історію транзакцій"
                }
              />
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 self-stretch overflow-y-auto">
              {transactions.length > 0 ? (
                pagedHomeTransactions.map((tx) => (
                  <Link
                    key={tx.id}
                    href={`/transfers?tx=${encodeURIComponent(tx.id)}`}
                    className={FOCUSABLE_LINK}
                  >
                    <TransactionCard
                      interactive
                      transaction={{
                        ...tx,
                        name: resolveDisplayName(tx),
                      }}
                    />
                  </Link>
                ))
              ) : (
                <p className="text-ink-placeholder m-0 self-stretch py-8 text-center text-sm">
                  Історія порожня
                </p>
              )}
            </div>
            {transactions.length > 0 && (
              <PanelPagination
                currentPage={txPageClamped}
                totalPages={totalTxPages}
                onPrevious={() =>
                  setTxPage((p) =>
                    Math.max(1, Math.min(p, totalTxPages) - 1),
                  )
                }
                onNext={() =>
                  setTxPage((p) =>
                    Math.min(
                      totalTxPages,
                      Math.min(p, totalTxPages) + 1,
                    ),
                  )
                }
              />
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
