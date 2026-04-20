import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { executeTransfer } from "@/lib/actions/transfer";
import { Card, TransferTarget } from "@/types";
function pickDefaultSource(cards: Card[]) {
  const first = cards.find((c) => c.status === "ACTIVE");
  return first ?? cards[0];
}
function pickDefaultDest(cards: Card[], sourceId: string) {
  const receivers = cards.filter((c) => c.status === "ACTIVE");
  const notSource = receivers.find((c) => c.id !== sourceId);
  if (notSource) return notSource;
  return receivers[0] ?? cards[0];
}
const isValidCardOrIban = (value: string): boolean => {
  const cleaned = value.replace(/\s/g, "");
  const isCard = /^\d{16,19}$/.test(cleaned);
  const isIban = /^UA\d{27}$/.test(cleaned.toUpperCase());
  return isCard || isIban;
};
export function useTransferForm(sourceCards: Card[], destCards: Card[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const cardsDataKey = useMemo(
    () =>
      [sourceCards, destCards]
        .map((arr) =>
          arr.map((c) => `${c.id}:${c.balance}:${c.status}`).join("|"),
        )
        .join("||"),
    [sourceCards, destCards],
  );
  const [sourceCard, setSourceCard] = useState<Card>(() =>
    pickDefaultSource(sourceCards),
  );
  const [destCard, setDestCard] = useState<Card>(() =>
    pickDefaultDest(destCards, pickDefaultSource(sourceCards).id),
  );
  const [targetType, setTargetType] = useState<TransferTarget>("own");
  const [externalCard, setExternalCard] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [cardError, setCardError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showDestPicker, setShowDestPicker] = useState(false);
  const hasOwnTargetOptions = useMemo(
    () =>
      destCards.some((c) => c.status === "ACTIVE" && c.id !== sourceCard.id),
    [destCards, sourceCard.id],
  );
  useLayoutEffect(() => {
    const params = new URLSearchParams(query);
    const target = params.get("target");
    if (target) {
      setTargetType("external");
      setExternalCard(target);
      return;
    }
    if (params.get("external") === "1") {
      setTargetType("external");
      setExternalCard("");
    }
  }, [query]);
  useEffect(() => {
    if (sourceCards.length === 0 || destCards.length === 0) return;
    setSourceCard((cur) => {
      const m = sourceCards.find((c) => c.id === cur.id);
      if (m) return m;
      return pickDefaultSource(sourceCards);
    });
    setDestCard((cur) => {
      const m = destCards.find((c) => c.id === cur.id);
      if (m) return m;
      return pickDefaultDest(destCards, sourceCard.id);
    });
  }, [cardsDataKey, sourceCards, destCards, sourceCard.id]);
  useEffect(() => {
    if (destCards.length === 0) return;
    if (sourceCard.id !== destCard.id) return;
    const next = pickDefaultDest(destCards, sourceCard.id);
    if (next.id === sourceCard.id) return;
    setDestCard(next);
  }, [sourceCard.id, destCard.id, destCards]);
  useEffect(() => {
    if (hasOwnTargetOptions) return;
    if (targetType === "external") return;
    setTargetType("external");
    setShowDestPicker(false);
  }, [hasOwnTargetOptions, targetType]);
  const validate = useCallback((): boolean => {
    let valid = true;
    setAmountError("");
    setCardError("");
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setAmountError("Введіть коректну суму");
      valid = false;
    } else if (parsed < 0.01) {
      setAmountError("Мінімальна сума переказу — 0.01 UAH");
      valid = false;
    } else if (parsed > sourceCard?.balance) {
      setAmountError("Недостатньо коштів на картці");
      valid = false;
    }
    if (sourceCard && sourceCard.status !== "ACTIVE") {
      setCardError("Картка відправника тимчасово призупинена");
      valid = false;
    }
    if (targetType === "own" && destCard && destCard.status !== "ACTIVE") {
      setCardError("Картка отримувача тимчасово призупинена");
      valid = false;
    }
    if (targetType === "own" && destCard?.id === sourceCard?.id) {
      setCardError("Картка відправника та отримувача повинні відрізнятись");
      valid = false;
    }
    if (targetType === "external" && !isValidCardOrIban(externalCard)) {
      setCardError("Введіть коректний номер картки або IBAN");
      valid = false;
    }
    return valid;
  }, [amount, sourceCard, destCard, targetType, externalCard]);
  const handleSubmitClick = useCallback(() => {
    if (validate()) setShowConfirm(true);
  }, [validate]);
  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const destination =
        targetType === "own" ? destCard.cardNumber : externalCard;
      if (!destination) {
        setCardError("Картку отримувача ще не активовано");
        return;
      }
      const result = await executeTransfer(sourceCard.id, destination, amount);
      if (result.success) {
        setSuccessMsg(
          `Переказ ${parseFloat(amount).toFixed(2)} UAH виконано успішно!`,
        );
        setAmount("");
        if (targetType === "external") setExternalCard("");
        await router.refresh();
      } else {
        setAmountError(result.error ?? "Помилка при переказі.");
      }
    } catch {
      setAmountError("Помилка при переказі. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  }, [amount, sourceCard, destCard, targetType, externalCard, router]);
  const handleCancelConfirm = useCallback(() => setShowConfirm(false), []);
  return {
    sourceCard,
    setSourceCard,
    destCard,
    setDestCard,
    targetType,
    setTargetType,
    externalCard,
    setExternalCard,
    amount,
    setAmount,
    amountError,
    cardError,
    showConfirm,
    isSubmitting,
    successMsg,
    setSuccessMsg,
    showSourcePicker,
    setShowSourcePicker,
    showDestPicker,
    setShowDestPicker,
    hasOwnTargetOptions,
    handleSubmitClick,
    handleConfirm,
    handleCancelConfirm,
  };
}
