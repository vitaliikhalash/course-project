"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { IconButton } from "@/components/icon-button";
import { SearchInput } from "@/components/search-input";
import { TransactionDrawer } from "@/components/transaction-drawer";
import {
  formatDatePillLabel,
  TransactionPeriodFilter,
} from "@/components/transaction-period-filter";
import { TransactionRow } from "@/components/transaction-row";
import { Panel } from "@/components/ui/panel";
import { maskCardShort } from "@/lib/card-mask";
import { resolveDisplayName } from "@/lib/transaction-display";
import { Card, Transaction } from "@/types";
const TX_QUERY = "tx";
const PAGE_SIZE = 10;
const FilterPill = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove?: () => void;
}) => (
  <span className="border-border-subtle bg-surface-subtle text-ink-strong inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm">
    {label}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        aria-label="Видалити фільтр"
        className="text-ink-strong hover:bg-surface-pressed flex h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 leading-none"
      >
        <Image
          src="/icons/close.svg"
          width={12}
          height={12}
          alt=""
          className="pointer-events-none block"
          aria-hidden
        />
      </button>
    )}
  </span>
);
function formatGroupLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const now = new Date();
  if (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  )
    return "Сьогодні";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    yesterday.getFullYear() === year &&
    yesterday.getMonth() + 1 === month &&
    yesterday.getDate() === day
  )
    return "Вчора";
  const date = new Date(year, month - 1, day, 12);
  const label = date.toLocaleDateString("uk-UA", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  return year !== now.getFullYear() ? `${label} ${year}` : label;
}
interface TransactionHistoryProps {
  transactions: Transaction[];
  onExportXLS?: () => void;
  className?: string;
  paginationClassName?: string;
  selectedCard?: Card | null;
  onClearCardFilter?: () => void;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (v: string) => void;
  onDateToChange?: (v: string) => void;
  onClearDateFilter?: () => void;
}
const TransactionHistoryInner = ({
  transactions,
  onExportXLS = () => {},
  className = "",
  paginationClassName = "",
  selectedCard,
  onClearCardFilter,
  dateFrom = "",
  dateTo = "",
  onDateFromChange,
  onDateToChange,
  onClearDateFilter,
}: TransactionHistoryProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const setTxQuery = useCallback(
    (id: string | null) => {
      const p = new URLSearchParams(searchParams.toString());
      if (id) p.set(TX_QUERY, id);
      else p.delete(TX_QUERY);
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams],
  );
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [transactions]);
  const displayNames = useMemo(
    () =>
      new Map(
        transactions.map((tx) => [tx.id, resolveDisplayName(tx, selectedCard)]),
      ),
    [transactions, selectedCard],
  );
  const filtered = useMemo(
    () =>
      transactions.filter((tx) =>
        (displayNames.get(tx.id) ?? tx.name)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [transactions, searchQuery, displayNames],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of visible) {
      const bucket = map.get(tx.dateKey) ?? [];
      bucket.push(tx);
      map.set(tx.dateKey, bucket);
    }
    return Array.from(map.entries());
  }, [visible]);
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const txIdFromUrl = searchParams.get(TX_QUERY);
  useEffect(() => {
    if (!txIdFromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL ?tx= drives drawer
      setSelectedTransaction(null);
      return;
    }
    const tx = transactions.find((t) => t.id === txIdFromUrl);
    if (!tx) {
      setTxQuery(null);
      return;
    }
    const name = resolveDisplayName(tx, selectedCard);
    setSelectedTransaction({
      ...tx,
      name,
    });
  }, [txIdFromUrl, transactions, selectedCard, setTxQuery]);
  const showFilterUI = onDateFromChange !== undefined;
  const hasDateFilter = Boolean(dateFrom || dateTo);
  const hasFilters = Boolean(selectedCard || hasDateFilter);
  return (
    <>
      <Panel
        as="section"
        aria-labelledby="tx-history-heading"
        className={`text-ink-strong flex flex-col items-center gap-4 p-4 ${className}`}
      >
        <h2
          id="tx-history-heading"
          className="text-ink-strong m-0 self-stretch text-base font-medium"
        >
          Історія транзакцій
        </h2>

        <div className="@container flex min-w-0 flex-col gap-4 self-stretch">
          <div className="text-ink-strong flex items-center justify-between gap-3 self-stretch text-base">
            <SearchInput
              id="tx-search"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Пошук"
              label="Пошук транзакцій"
              className="text-ink-strong [&_input]:text-ink-strong [&_input]:placeholder:text-ink-strong/70 flex-1 @min-[40rem]:w-60 @min-[40rem]:flex-none"
            />
            <button
              type="button"
              onClick={onExportXLS}
              aria-label="Експортувати транзакції у XLS"
              className="group flex shrink-0 cursor-pointer items-center gap-2 border-none bg-transparent"
            >
              <span className="font-montserrat text-ink-strong hidden text-sm underline @min-[40rem]:inline">
                Експортувати у XLS
              </span>
              <div className="rounded-num-5 bg-surface-subtle group-hover:bg-surface-pressed pointer-events-none flex h-6 w-6 items-center justify-center">
                <Image
                  className="pointer-events-none"
                  src="/icons/download.svg"
                  width={20}
                  height={20}
                  alt=""
                  aria-hidden="true"
                />
              </div>
            </button>
          </div>

          {showFilterUI && (
            <TransactionPeriodFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={(v) => {
                onDateFromChange?.(v);
                setCurrentPage(1);
              }}
              onDateToChange={(v) => {
                onDateToChange?.(v);
                setCurrentPage(1);
              }}
            />
          )}
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 self-stretch">
            {selectedCard && (
              <FilterPill
                label={`Картка: ${maskCardShort(selectedCard.cardNumber)}`}
                onRemove={() => {
                  onClearCardFilter?.();
                  setCurrentPage(1);
                }}
              />
            )}
            {hasDateFilter && (
              <FilterPill
                label={formatDatePillLabel(dateFrom, dateTo)}
                onRemove={() => {
                  onClearDateFilter?.();
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        )}

        {grouped.length > 0 ? (
          <div className="flex flex-col gap-3 self-stretch">
            {grouped.map(([dateKey, txs]) => (
              <div
                key={dateKey}
                className="border-border-subtle min-w-0 overflow-hidden rounded-lg border bg-white"
              >
                <div className="divide-border-subtle divide-y">
                  <div className="text-ink-strong px-4 py-2 text-sm font-medium">
                    {formatGroupLabel(dateKey)}
                  </div>
                  {txs.map((tx) => {
                    const name = displayNames.get(tx.id) ?? tx.name;
                    return (
                      <TransactionRow
                        key={tx.id}
                        transaction={{
                          ...tx,
                          name,
                        }}
                        onClick={() => setTxQuery(tx.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-placeholder m-0 self-stretch py-8 text-center text-sm">
            Транзакцій не знайдено
          </p>
        )}

        <div
          className={`text-ink-strong mt-2 flex items-center justify-center gap-2 self-stretch text-sm ${paginationClassName}`}
        >
          <IconButton
            icon="/icons/arrow-left.svg"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Попередня сторінка"
          />
          <span
            aria-live="polite"
            aria-atomic="true"
            className="min-w-8 text-center font-medium"
          >
            {currentPage}/{totalPages}
          </span>
          <IconButton
            icon="/icons/arrow-right.svg"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Наступна сторінка"
          />
        </div>
      </Panel>
      <TransactionDrawer
        transaction={selectedTransaction}
        onClose={() => setTxQuery(null)}
      />
    </>
  );
};
export const TransactionHistory = (props: TransactionHistoryProps) => (
  <Suspense fallback={null}>
    <TransactionHistoryInner {...props} />
  </Suspense>
);
