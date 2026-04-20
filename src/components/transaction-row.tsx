import { Transaction } from "@/types";
interface TransactionRowProps {
  transaction: Transaction;
  onClick?: () => void;
  flush?: boolean;
}
export const TransactionRow = ({
  transaction,
  onClick,
  flush = false,
}: TransactionRowProps) => {
  const horizontalPadding = flush ? "px-0" : "px-4";
  const interactivity = onClick ? "cursor-pointer hover:bg-surface-card" : "";
  const amountColor = transaction.isOutgoing ? "text-danger" : "text-success";
  return (
    <div
      className={`grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_auto_auto] items-center gap-2 py-4 transition-colors ${horizontalPadding} ${interactivity}`}
      onClick={onClick}
    >
      <span className="text-ink-strong shrink-0 text-sm tabular-nums">
        {transaction.timeOnly}
      </span>

      <span className="text-ink-strong min-w-0 truncate text-sm">
        {transaction.name}
      </span>

      <span
        className={`shrink-0 text-sm font-medium whitespace-nowrap tabular-nums ${amountColor}`}
      >
        {transaction.amount}
      </span>

      <span className="text-ink-strong shrink-0 text-right text-sm whitespace-nowrap tabular-nums">
        {transaction.balanceAfter !== null
          ? transaction.balanceAfter.toLocaleString("uk-UA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) + " грн"
          : "—"}
      </span>
    </div>
  );
};
