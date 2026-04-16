"use client";

const TRANSACTION_PERIOD_DATE_INPUT_CLASS =
  "px-2 py-1.5 rounded-lg border border-border-subtle bg-white text-sm text-ink-strong outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer";
const INPUT_NARROW = `${TRANSACTION_PERIOD_DATE_INPUT_CLASS} w-auto max-w-[11rem] shrink-0 min-w-0`;
export function formatDatePillLabel(dateFrom: string, dateTo: string): string {
  const fmt = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
    });
  if (dateFrom && dateTo) return `${fmt(dateFrom)} до ${fmt(dateTo)}`;
  if (dateFrom) return `Від ${fmt(dateFrom)}`;
  return `До ${fmt(dateTo)}`;
}
interface TransactionPeriodFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  className?: string;
}
export function TransactionPeriodFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  className = "",
}: TransactionPeriodFilterProps) {
  return (
    <div
      className={`text-ink-strong min-w-0 self-stretch text-sm ${className}`.trim()}
    >
      <div className="hidden flex-wrap items-center gap-2 self-stretch @min-[40rem]:flex">
        <span className="shrink-0">Період:</span>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(e) => onDateFromChange(e.target.value)}
          aria-label="Початок періоду"
          className={TRANSACTION_PERIOD_DATE_INPUT_CLASS}
        />

        <span className="shrink-0" aria-hidden>
          до
        </span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(e) => onDateToChange(e.target.value)}
          aria-label="Кінець періоду"
          className={TRANSACTION_PERIOD_DATE_INPUT_CLASS}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-2 @min-[40rem]:hidden">
        <span className="shrink-0">Період:</span>
        <div className="flex w-full min-w-0 flex-wrap items-center justify-start gap-2">
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => onDateFromChange(e.target.value)}
            aria-label="Початок періоду"
            className={INPUT_NARROW}
          />

          <span className="shrink-0" aria-hidden>
            до
          </span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onDateToChange(e.target.value)}
            aria-label="Кінець періоду"
            className={INPUT_NARROW}
          />
        </div>
      </div>
    </div>
  );
}
