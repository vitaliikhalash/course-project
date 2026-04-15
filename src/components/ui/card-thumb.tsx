import Image from "next/image";
import type { CSSProperties } from "react";
import { CardTier, PaymentSystem } from "@/types";
interface CardThumbProps {
  tier: CardTier;
  paymentSystem: PaymentSystem;
}
const CARD_BG_THUMB: Record<CardTier, string> = {
  STANDARD: "/images/card-bg-standard-thumb.jpg",
  GOLD: "/images/card-bg-gold-thumb.jpg",
};
const PS_LOGO: Record<PaymentSystem, string> = {
  VISA: "/icons/visa.svg",
  MASTERCARD: "/icons/mastercard.svg",
};
export const CardThumb = ({ tier, paymentSystem }: CardThumbProps) => (
  <div
    style={
      {
        "--card-bg": `url(${CARD_BG_THUMB[tier]})`,
      } as CSSProperties
    }
    className="relative h-[4.4rem] w-[7.35rem] shrink-0 overflow-hidden rounded-lg bg-[image:var(--card-bg)] bg-cover bg-center"
    aria-hidden="true"
  >
    <Image
      src={PS_LOGO[paymentSystem]}
      alt=""
      width={32}
      height={20}
      className="absolute right-[0.3rem] bottom-[0.3rem] h-4 w-auto object-contain"
      style={{
        width: "auto",
      }}
      aria-hidden="true"
    />
  </div>
);
