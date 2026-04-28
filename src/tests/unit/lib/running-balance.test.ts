import { describe, expect, it } from "vitest";
import { computeRunningBalances, TxForBalance } from "@/lib/running-balance";
describe("lib/runningBalance", () => {
  it("computes balance after each tx for outgoing and incoming entries", () => {
    const txs: TxForBalance[] = [
      {
        id: "newest-out",
        isOutgoing: true,
        fromCardId: "card-1",
        toCardId: "card-2",
        amount: "-100.50",
      },
      {
        id: "older-in",
        isOutgoing: false,
        fromCardId: "card-3",
        toCardId: "card-1",
        amount: "50",
      },
    ];
    const current = new Map<string, number>([["card-1", 1000]]);
    const result = computeRunningBalances(txs, current);
    expect(result.get("newest-out")).toBe(1000);
    expect(result.get("older-in")).toBe(1100.5);
  });
  it("skips transactions for unknown cards", () => {
    const txs: TxForBalance[] = [
      {
        id: "tx-1",
        isOutgoing: true,
        fromCardId: "unknown",
        toCardId: null,
        amount: "10",
      },
    ];
    const result = computeRunningBalances(txs, new Map([["card-1", 500]]));
    expect(result.size).toBe(0);
  });
});
