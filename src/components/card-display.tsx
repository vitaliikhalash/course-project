import { CardThumb } from "@/components/ui/card-thumb";
import { maskCardShort, maskIbanLong } from "@/lib/card-mask";
import { Card } from "@/types";
interface CardDisplayProps {
  card: Card;
  disabled?: boolean;
}
export const CardDisplay = ({ card, disabled = false }: CardDisplayProps) => {
  const nameClass = disabled ? "text-ink-muted" : "text-black";
  const subClass = disabled ? "text-ink-muted" : "text-ink-strong";
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className={disabled ? "shrink-0 opacity-50" : "shrink-0"}>
        <CardThumb tier={card.tier} paymentSystem={card.paymentSystem} />
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-col items-start gap-2 text-sm ${nameClass}`}
      >
        <div className="w-full truncate font-medium">{card.name}</div>
        <div className={`flex w-full items-center gap-2.5 ${subClass}`}>
          <div className="shrink-0 whitespace-nowrap">
            {maskCardShort(card.cardNumber)}
          </div>
          <div className="bg-border-subtle h-4 w-px shrink-0" />
          <div className="truncate whitespace-nowrap">
            {maskIbanLong(card.iban)}
          </div>
        </div>
        <div className={`whitespace-nowrap ${subClass}`}>
          {card.balance.toLocaleString("uk-UA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {card.currency}
        </div>
      </div>
    </div>
  );
};
