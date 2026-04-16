import Image from "next/image";
import type { CSSProperties } from "react";
import { maskCardFull, maskIban } from "@/lib/card-mask";
import { Card, CardTier, PaymentSystem } from "@/types";
interface CardTileProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
}
const TILE_BASE =
  "relative w-full rounded-lg aspect-[18.375/11] p-0.5 border bg-white outline-none transition-all";
const TILE_SELECTED = "border-ink-bold ring-1 ring-inset ring-ink-bold";
const TILE_IDLE = "border-border-subtle hover:border-ink-strong";
const CARD_BG: Record<CardTier, string> = {
  STANDARD: "/images/card-bg-standard.jpg",
  GOLD: "/images/card-bg-gold.jpg",
};
const PS_LOGO: Record<PaymentSystem, string> = {
  VISA: "/icons/visa.svg",
  MASTERCARD: "/icons/mastercard.svg",
};
export const CardTile = ({
  card,
  isSelected = false,
  onClick,
}: CardTileProps) => {
  const interactiveCls = onClick ? "cursor-pointer" : "";
  const outlineCls = isSelected ? TILE_SELECTED : TILE_IDLE;
  if (card.status === "PENDING") {
    return (
      <div
        className={`${TILE_BASE} ${interactiveCls} ${outlineCls} border-dashed opacity-70`}
        aria-label={`Заявка на картку: ${card.name}`}
        onClick={onClick}
      >
        <div className="box-border flex h-full flex-col items-start justify-between gap-3 rounded-md bg-white p-4">
          <div className="flex flex-1 flex-col items-start gap-2 self-stretch">
            <div className="text-ink-placeholder">{card.name}</div>
            <div className="text-ink-placeholder animate-pulse">
              Заявку на розгляді…
            </div>
          </div>
          <div className="text-ink-placeholder self-stretch text-xs">
            Очікуйте активації картки
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      style={
        {
          "--card-bg": `url(${CARD_BG[card.tier]})`,
        } as CSSProperties
      }
      className={`${TILE_BASE} ${interactiveCls} ${outlineCls}`}
      onClick={onClick}
      aria-pressed={isSelected}
      role={onClick ? "button" : undefined}
    >
      <div className="relative h-full min-h-0 w-full overflow-hidden rounded-md">
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[image:var(--card-bg)] bg-cover bg-center"
          aria-hidden
        />

        <div className="relative z-10 box-border flex h-full min-h-0 flex-col items-start justify-between gap-3 p-4">
          <div className="flex flex-1 flex-col items-start gap-2 self-stretch">
            <div className="text-white">{card.name}</div>
            <div className="text-white/90">{maskCardFull(card.cardNumber)}</div>
            <div className="text-xs text-white/80">{maskIban(card.iban)}</div>
          </div>
          <div className="self-stretch font-medium text-white">
            {card.balance.toLocaleString("uk-UA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {card.currency}
          </div>
        </div>
        <Image
          src={PS_LOGO[card.paymentSystem]}
          alt={card.paymentSystem}
          width={56}
          height={36}
          className="absolute right-3 bottom-3 z-10 h-7 w-auto object-contain"
          style={{
            width: "auto",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
