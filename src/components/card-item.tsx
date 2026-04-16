import { CardThumb } from "@/components/ui/card-thumb";
import { maskCardShort, maskIbanLong } from "@/lib/card-mask";
import { Card } from "@/types";
interface CardItemProps {
  card: Card;
  interactive?: boolean;
}
export const CardItem = ({ card, interactive = false }: CardItemProps) => {
  const interactiveClasses = interactive
    ? "cursor-pointer group-hover:bg-surface-card active:bg-surface-subtle"
    : "";
  const panMasked = maskIbanLong(card.iban);
  return (
    <div
      className={`border-border-subtle flex min-w-0 items-center gap-3 self-stretch rounded-lg border bg-white p-4 transition-colors ${interactiveClasses}`}
    >
      <CardThumb tier={card.tier} paymentSystem={card.paymentSystem} />
      <div className="flex min-h-[4.4rem] min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="min-w-0 self-stretch truncate leading-normal">
          {card.name}
        </div>
        <div className="flex min-w-0 items-center gap-2.5 self-stretch">
          <div className="shrink-0 tabular-nums">
            {maskCardShort(card.cardNumber)}
          </div>
          <div className="border-border-subtle box-border h-[1.125rem] w-px shrink-0 border-r" />
          <div
            className="min-w-0 flex-1 truncate text-left tabular-nums"
            title={panMasked ?? undefined}
          >
            {panMasked}
          </div>
        </div>
        <div className="min-w-0 self-stretch">
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
