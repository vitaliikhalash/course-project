import * as XLSX from "xlsx";
import { Transaction } from "@/types";
const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Виконано",
  PENDING: "В обробці",
  FAILED: "Не вдалося",
};
export function exportTransactionsXls(
  transactions: Transaction[],
  filename = "транзакції",
): void {
  const rows = transactions.map((tx) => ({
    Дата: tx.time,
    Час: tx.timeOnly,
    Опис: tx.name,
    Сума: tx.amount,
    "Баланс після":
      tx.balanceAfter !== null
        ? tx.balanceAfter.toLocaleString("uk-UA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) + " грн"
        : "—",
    Статус: STATUS_LABELS[tx.status] ?? tx.status,
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length),
    ),
  }));
  worksheet["!cols"] = colWidths;
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Транзакції");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
