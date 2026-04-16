"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import { Panel } from "@/components/ui/panel";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { Toast } from "@/components/ui/toast";
import { requestCard } from "@/lib/actions/card";
import type { CardTier, CardType, PaymentSystem } from "@/types";
interface Product {
  cardType: CardType;
  name: string;
  description: string;
  features: string[];
}
interface FormData {
  paymentSystem: PaymentSystem;
  tier: CardTier;
}
const PRODUCTS: Product[] = [
  {
    cardType: "DIGITAL",
    name: "Digital картка",
    description:
      "Цифрова картка без пластику. Оплата в Apple Pay та Google Pay.",
    features: [
      "Кредитний ліміт до 500 000 UAH",
      "Пільговий період до 55 днів",
      "Оплата без комісій, у т.ч. Apple Pay та Google Pay",
    ],
  },
  {
    cardType: "UNIVERSAL",
    name: "Картка Універсальна",
    description: "Зручна картка для щоденних покупок, переказів та накопичень.",
    features: [
      "Безкоштовне обслуговування",
      "Кешбек на обрані категорії",
      "Зарплатна та пенсійна програми",
    ],
  },
];
const PS_LABELS: Record<PaymentSystem, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
};
const PS_COLOR_LOGO: Record<PaymentSystem, string> = {
  VISA: "/icons/visa-color.svg",
  MASTERCARD: "/icons/mastercard-color.svg",
};
const PS_LOGO: Record<PaymentSystem, string> = {
  VISA: "/icons/visa.svg",
  MASTERCARD: "/icons/mastercard.svg",
};
const CARD_BG: Record<CardTier, string> = {
  STANDARD: "/images/card-bg-standard.jpg",
  GOLD: "/images/card-bg-gold.jpg",
};
const SELECTABLE_OUTLINE_BASE =
  "rounded-lg border bg-white cursor-pointer outline-none transition-all";
const SELECTABLE_OUTLINE_SELECTED =
  "border-ink-bold ring-1 ring-inset ring-ink-bold";
const SELECTABLE_OUTLINE_IDLE = "border-border-subtle hover:border-ink-strong";
const SELECTABLE_ROW_BASE =
  "border-border-subtle hover:bg-surface-card active:bg-surface-subtle flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white p-4 text-left transition-colors outline-none";
const PaymentSystemCard = ({
  system,
  selected,
  onClick,
}: {
  system: PaymentSystem;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-3 p-4 ${SELECTABLE_OUTLINE_BASE} ${selected ? SELECTABLE_OUTLINE_SELECTED : SELECTABLE_OUTLINE_IDLE}`}
  >
    <Image
      src={PS_COLOR_LOGO[system]}
      alt={system}
      width={64}
      height={36}
      className="h-9 w-16 object-contain"
    />
    <span className="text-ink-strong text-sm">{PS_LABELS[system]}</span>
  </button>
);
const TierCard = ({
  tier,
  paymentSystem,
  selected,
  onClick,
}: {
  tier: CardTier;
  paymentSystem: PaymentSystem;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-w-0 flex-1 p-0.5 ${SELECTABLE_OUTLINE_BASE} ${selected ? SELECTABLE_OUTLINE_SELECTED : SELECTABLE_OUTLINE_IDLE}`}
  >
    <div
      style={
        {
          "--card-bg": `url(${CARD_BG[tier]})`,
        } as CSSProperties
      }
      className="relative flex aspect-[18.375/11] w-full flex-col justify-between overflow-hidden rounded-md bg-[image:var(--card-bg)] bg-cover bg-center p-3"
    >
      <span className="text-sm font-medium text-white">
        {tier === "GOLD" ? "Золота" : "Стандарт"}
      </span>
      <div className="flex items-end justify-between">
        <span className="font-mono text-sm text-white/80">
          •••• •••• •••• ••••
        </span>
        <Image
          src={PS_LOGO[paymentSystem]}
          alt={paymentSystem}
          width={48}
          height={28}
          className="h-[1.625rem] w-auto object-contain"
          style={{
            width: "auto",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  </button>
);
const DEFAULT_FORM: FormData = {
  paymentSystem: "MASTERCARD",
  tier: "STANDARD",
};
export default function AddCardWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState<"default" | "error">(
    "default",
  );
  const patch = (partial: Partial<FormData>) =>
    setForm((prev) => ({
      ...prev,
      ...partial,
    }));
  const handleSelectProduct = (p: Product) => {
    setProduct(p);
    setStep(2);
  };
  const handleSubmit = async () => {
    if (!product) return;
    setSubmitting(true);
    const name = form.tier === "GOLD" ? `${product.name} Золота` : product.name;
    const result = await requestCard({
      name,
      type: product.cardType,
      paymentSystem: form.paymentSystem,
      tier: form.tier,
    });
    if (result.success) {
      setToastVariant("default");
      setToastMsg("Заявку на картку успішно подано!");
      setTimeout(() => router.push("/wallet"), 1800);
    } else {
      setSubmitting(false);
      setToastVariant("error");
      setToastMsg(result.error ?? "Помилка при подачі заявки");
    }
  };
  const dismissToast = useCallback(() => setToastMsg(""), []);
  if (step === 1) {
    return (
      <>
        <Panel className="flex flex-col gap-4 p-4">
          <h2 className="text-ink-strong m-0 text-base font-medium">
            Оберіть продукт
          </h2>

          <div className="flex flex-col gap-3">
            {PRODUCTS.map((p) => (
              <button
                key={p.cardType}
                type="button"
                onClick={() => handleSelectProduct(p)}
                className={`${SELECTABLE_ROW_BASE}`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-ink-strong text-sm font-medium">
                    {p.name}
                  </span>
                  <span className="leading-prose text-ink-strong text-sm">
                    {p.description}
                  </span>
                </div>
                <Image
                  src="/icons/arrow-right.svg"
                  width={18}
                  height={18}
                  alt=""
                  aria-hidden="true"
                  className="shrink-0"
                />
              </button>
            ))}
          </div>

          <div className="flex justify-center self-stretch">
            <SecondaryButton
              onClick={() => router.back()}
              className="w-auto self-center"
            >
              Назад
            </SecondaryButton>
          </div>
        </Panel>

        {toastMsg && (
          <Toast
            message={toastMsg}
            variant={toastVariant}
            onDismiss={dismissToast}
          />
        )}
      </>
    );
  }
  if (!product) return null;
  return (
    <>
      <Panel className="flex flex-col gap-4 p-4">
        <h2 className="text-ink-strong m-0 text-base font-medium">
          {product.name}
        </h2>

        <div className="flex flex-col gap-2.5">
          <span className="text-ink-strong text-sm font-medium">
            Платіжна система
          </span>
          <div className="flex items-center gap-3">
            {(["VISA", "MASTERCARD"] as PaymentSystem[]).map((sys) => (
              <PaymentSystemCard
                key={sys}
                system={sys}
                selected={form.paymentSystem === sys}
                onClick={() =>
                  patch({
                    paymentSystem: sys,
                  })
                }
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-ink-strong text-sm font-medium">
            Картковий продукт
          </span>
          <div className="flex items-stretch gap-3">
            {(["STANDARD", "GOLD"] as CardTier[]).map((t) => (
              <TierCard
                key={t}
                tier={t}
                paymentSystem={form.paymentSystem}
                selected={form.tier === t}
                onClick={() =>
                  patch({
                    tier: t,
                  })
                }
              />
            ))}
          </div>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-center gap-3 self-stretch">
          <SecondaryButton
            onClick={() => setStep(1)}
            className="w-auto self-center"
          >
            Назад
          </SecondaryButton>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={submitting}
            aria-busy={submitting}
            className="w-auto self-center"
          >
            {submitting ? "Обробка…" : "Далі"}
          </PrimaryButton>
        </div>
      </Panel>

      {toastMsg && (
        <Toast
          message={toastMsg}
          variant={toastVariant}
          onDismiss={dismissToast}
        />
      )}
    </>
  );
}
