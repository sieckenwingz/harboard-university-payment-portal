import { Payment } from "./models/Payment";

type GCashTransaction = {
  date: string;
  description: string;
  refNo: string;
  debit: string | null;
  credit: string | null;
  balance: string;
};

export function extractGcashTransactions(text: string): GCashTransaction[] {
  const transactionRegex =
    /(\d{4}-\d{2}-\d{2} \d{2}:\d{2} [AP]M)\s+(.+?)\s+(\d{13})\s+((\d+\.\d{2})?)\s*((\d+\.\d{2})?)\s+(\d+\.\d{2})/g;

  const transactions: GCashTransaction[] = [];
  let match: RegExpExecArray | null;

  while ((match = transactionRegex.exec(text)) !== null) {
    const [
      _,
      date,
      description,
      refNo,
      _debitGroup,
      debit,
      _creditGroup,
      credit,
      balance
    ] = match;

    transactions.push({
      date,
      description: description.trim(),
      refNo,
      debit: debit || null,
      credit: credit || null,
      balance
    });
  }

  return transactions;
}

export function checkTransactionDetails(found: GCashTransaction, payment: Payment) {
  try {
    return parseInt((parseFloat(found.debit!) * 100).toString()) == payment.amount
  } catch {
    return false;
  }
}
