"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { requestUnfreezeCard } from "@/lib/actions/card";
interface UnfreezeRequestFormProps {
  cardId: string;
  onSuccess?: () => void;
}
export function UnfreezeRequestForm({
  cardId,
  onSuccess,
}: UnfreezeRequestFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <form
      className="m-0 flex w-full min-w-0 justify-center"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        try {
          await requestUnfreezeCard(cardId);
          onSuccess?.();
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
    >
      <PrimaryButton
        type="submit"
        disabled={pending}
        className="box-border w-auto max-w-full"
        aria-busy={pending}
      >
        {pending ? "Відправлення…" : "Подати заявку на розмороження"}
      </PrimaryButton>
    </form>
  );
}
