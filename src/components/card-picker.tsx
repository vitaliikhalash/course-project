"use client";

import Image from "next/image";
import { CardDisplay } from "@/components/card-display";
import { cn } from "@/lib/cn";
import { Card } from "@/types";
const ChevronDecoration = ({ openUpward }: { openUpward?: boolean }) => (
  <span
    className="pointer-events-none flex shrink-0 items-center justify-center"
    aria-hidden
  >
    <div className="relative h-5 w-5 shrink-0 overflow-hidden">
      <Image
        src="/icons/arrow-down.svg"
        width={20}
        height={20}
        alt=""
        className={cn(
          "absolute max-h-full w-full max-w-full overflow-hidden transition-transform",
          openUpward && "rotate-180",
        )}
        aria-hidden
      />
    </div>
  </span>
);
interface CardPickerProps {
  cards: Card[];
  isItemDisabled?: (card: Card) => boolean;
  selected: Card;
  onSelect: (card: Card) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  label: string;
}
const TRIGGER_BASE =
  "flex w-full items-center gap-3 border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-subtle focus-visible:ring-offset-0";
const DISABLED_SURFACE = "bg-surface-app";
const DISABLED_ITEM_ROW = `flex w-full items-center p-4 gap-3 ${DISABLED_SURFACE} cursor-not-allowed select-none border-border-subtle text-left text-ink-muted [&_*]:cursor-inherit`;
export const CardPicker = ({
  cards,
  isItemDisabled,
  selected,
  onSelect,
  isOpen,
  onOpen,
  onClose,
  label,
}: CardPickerProps) => {
  const hasMultipleCards = cards.length > 1;
  const isDisabled = !hasMultipleCards;
  const hasNoCards = cards.length === 0;
  const isItemD = isItemDisabled ?? (() => false);
  const stateClasses = isDisabled
    ? hasNoCards
      ? "cursor-not-allowed text-ink-muted"
      : "cursor-not-allowed"
    : "cursor-pointer hover:bg-surface-card active:bg-surface-subtle";
  const triggerClassName = cn(
    TRIGGER_BASE,
    isOpen
      ? "cursor-pointer rounded-t-lg border-x-0 border-t-0 border-b border-border-subtle bg-white hover:bg-surface-card active:bg-surface-subtle"
      : [
          "rounded-lg border-border-subtle",
          hasNoCards ? DISABLED_SURFACE : "bg-white",
          stateClasses,
        ],
  );
  return (
    <div
      className={cn(
        isOpen &&
          "border-border-subtle relative z-10 flex w-full flex-col overflow-hidden rounded-lg border bg-white",
      )}
    >
      <button
        type="button"
        onClick={isOpen ? onClose : onOpen}
        disabled={isDisabled}
        aria-label={isOpen ? "Закрити список карток" : label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={triggerClassName}
      >
        <div className="min-w-0 flex-1">
          <CardDisplay card={selected} disabled={hasNoCards} />
        </div>
        {hasMultipleCards && <ChevronDecoration openUpward={isOpen} />}
      </button>

      {isOpen && (
        <div
          className="max-h-[19.2rem] overflow-y-auto"
          role="listbox"
          aria-label={label}
        >
          {cards
            .filter((c) => c.id !== selected.id)
            .map((card, index) => {
              const itemOff = isItemD(card);
              return (
                <div
                  key={card.id}
                  role="option"
                  aria-selected={false}
                  aria-disabled={itemOff}
                >
                  {itemOff ? (
                    <div
                      className={cn(
                        DISABLED_ITEM_ROW,
                        index !== 0 && "border-border-subtle border-t",
                      )}
                      title="Картка тимчасово призупинена"
                    >
                      <div className="min-w-0 flex-1">
                        <CardDisplay card={card} disabled />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(card);
                        onClose();
                      }}
                      className={cn(
                        "hover:bg-surface-card active:bg-surface-subtle flex w-full cursor-pointer items-center gap-3 bg-white p-4 text-left transition-colors",
                        index !== 0 && "border-border-subtle border-t",
                      )}
                    >
                      <CardDisplay card={card} />
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
