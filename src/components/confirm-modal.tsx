import { ModalOverlay } from "@/components/ui/modal-overlay";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { maskCardShort } from "@/lib/card-mask";
import { Card, TransferTarget } from "@/types";
interface ConfirmModalProps {
  sourceCard: Card;
  targetType: TransferTarget;
  destCard: Card | null;
  externalCard: string;
  amount: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}
const ConfirmRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-5 self-stretch">
    <span className="leading-prose">{label}</span>
    <span>{value}</span>
  </div>
);
export const ConfirmModal = ({
  sourceCard,
  targetType,
  destCard,
  externalCard,
  amount,
  onConfirm,
  onCancel,
  isSubmitting,
}: ConfirmModalProps) => {
  const destination =
    targetType === "own" && destCard
      ? maskCardShort(destCard.cardNumber)
      : externalCard;
  return (
    <ModalOverlay
      role="dialog"
      aria-modal={true}
      aria-labelledby="confirm-title"
    >
      <h2
        id="confirm-title"
        className="leading-prose m-0 self-stretch text-xl font-medium"
      >
        Підтвердіть переказ
      </h2>
      <div className="flex flex-col items-start gap-3 self-stretch text-base">
        <ConfirmRow
          label="З картки:"
          value={maskCardShort(sourceCard.cardNumber)}
        />
        <ConfirmRow label="На картку:" value={destination} />
        <ConfirmRow
          label="Сума:"
          value={`${parseFloat(amount).toFixed(2)} UAH`}
        />
      </div>
      <p className="leading-prose m-0 self-stretch text-sm">
        Цю дію неможливо скасувати.
      </p>
      <div className="flex items-start gap-3 self-stretch">
        <PrimaryButton
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Обробка…" : "Підтвердити"}
        </PrimaryButton>
        <SecondaryButton
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Скасувати
        </SecondaryButton>
      </div>
    </ModalOverlay>
  );
};
