import { db } from "../db";

const getInvoiceSequenceByYear = db.prepare(
  "SELECT year, current_value FROM invoice_sequences WHERE year = ?"
);
const insertInvoiceSequence = db.prepare(
  "INSERT INTO invoice_sequences (year, current_value) VALUES (?, ?)"
);
const updateInvoiceSequence = db.prepare(
  "UPDATE invoice_sequences SET current_value = ? WHERE year = ?"
);

export function allocateInvoiceNumber(createdAtIso: string) {
  const year = new Date(createdAtIso).getFullYear();

  const nextValue = db.transaction(() => {
    const existing = getInvoiceSequenceByYear.get(year) as
      | { year: number; current_value: number }
      | undefined;

    if (!existing) {
      insertInvoiceSequence.run(year, 1);
      return 1;
    }

    const next = existing.current_value + 1;
    updateInvoiceSequence.run(next, year);
    return next;
  })();

  return `NS-INV-${year}-${String(nextValue).padStart(6, "0")}`;
}
