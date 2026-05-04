"use client";

import { IconButton } from "@/components/icon-button";

export interface PanelPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export const PanelPagination = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  className = "mt-2 flex items-center justify-center gap-2 self-stretch text-sm",
}: PanelPaginationProps) => {
  return (
    <div className={`text-ink-strong ${className}`.trim()}>
      <IconButton
        icon="/icons/arrow-left.svg"
        onClick={onPrevious}
        disabled={currentPage === 1}
        aria-label="Попередня сторінка"
      />
      <span
        aria-live="polite"
        aria-atomic="true"
        className="min-w-8 text-center font-medium"
      >
        {currentPage}/{totalPages}
      </span>
      <IconButton
        icon="/icons/arrow-right.svg"
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label="Наступна сторінка"
      />
    </div>
  );
};
