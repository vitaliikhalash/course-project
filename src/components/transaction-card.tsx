import { Transaction } from "@/types";
interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
  interactive?: boolean;
}
export const TransactionCard = ({
  transaction,
  onClick,
  interactive = false,
}: TransactionCardProps) => {
  const showAffordance = Boolean(onClick || interactive);
  let affordance = "";
  if (showAffordance) {
    const hover = onClick
      ? "hover:bg-surface-card"
      : "group-hover:bg-surface-card";
    affordance = `cursor-pointer active:bg-surface-subtle ${hover}`;
  }
  const amountColor = transaction.isOutgoing ? "text-danger" : "text-success";
  return (
    <div
      className={`border-border-subtle flex min-w-0 items-start justify-between gap-2 self-stretch rounded-lg border bg-white p-4 transition-colors ${affordance}`}
      onClick={onClick}
    >
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2 text-left">
        <span className="text-ink-strong truncate text-sm leading-tight font-medium">
          {transaction.name}
        </span>
        <span className="text-ink-strong text-sm leading-tight tabular-nums">
          {transaction.timeOnly}
        </span>
      </div>
      <span
        className={`shrink-0 self-start text-right text-sm font-medium whitespace-nowrap tabular-nums ${amountColor}`}
      >
        {transaction.amount}
      </span>
    </div>
  );
};
