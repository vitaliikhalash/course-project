"use client";

import Image from "next/image";
import { ModalOverlay } from "@/components/ui/modal-overlay";
interface SuccessModalProps {
  message: string;
  onClose: () => void;
}
export const SuccessModal = ({ message, onClose }: SuccessModalProps) => (
  <ModalOverlay
    onBackdropClick={onClose}
    panelClassName="gap-3 bg-white text-2xl text-center"
  >
    <div className="flex flex-col items-center gap-3 self-stretch text-center">
      <b className="leading-prose font-semibold tracking-[-0.02em]">Успіх</b>
      <p className="leading-prose m-0 max-w-full text-sm">{message}</p>
    </div>
    <Image src="/icons/success-check.svg" width={48} height={48} alt="Успіх" />
  </ModalOverlay>
);
