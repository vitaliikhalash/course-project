"use client";

import type { ReactNode } from "react";
import { SearchInput } from "@/components/search-input";
import { TransactionPeriodFilter } from "@/components/transaction-period-filter";

export interface PanelSearchToolbarProps {
  searchId: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  searchInputClassName?: string;
  rightSlot?: ReactNode;
  showPeriod?: boolean;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
}

export const PanelSearchToolbar = ({
  searchId,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Пошук",
  searchLabel = "Пошук",
  searchInputClassName = "text-ink-strong [&_input]:text-ink-strong [&_input]:placeholder:text-ink-strong/70 flex-1 @min-[40rem]:w-60 @min-[40rem]:flex-none",
  rightSlot,
  showPeriod = false,
  dateFrom = "",
  dateTo = "",
  onDateFromChange,
  onDateToChange,
}: PanelSearchToolbarProps) => {
  const hasPeriod =
    showPeriod &&
    onDateFromChange !== undefined &&
    onDateToChange !== undefined;
  return (
    <div className="@container flex min-w-0 flex-col gap-4 self-stretch">
      <div className="text-ink-strong flex items-center justify-between gap-3 self-stretch text-base">
        <SearchInput
          id={searchId}
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          label={searchLabel}
          className={searchInputClassName}
        />
        {rightSlot}
      </div>

      {hasPeriod && (
        <TransactionPeriodFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
        />
      )}
    </div>
  );
};
