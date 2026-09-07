export const VALIDATION = {
  organisationId: /^[A-Za-z0-9_-]{3,100}$/,
  employeeId: /^[A-Za-z0-9._-]{3,50}$/,
  branchCode: /^[A-Za-z0-9-]{2,20}$/,
  accountNumber: /^(?:\d{9,18}|X{2,}\d{4,18})$/,
  mobile: /^[6-9]\d{9}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  rrn: /^\d{6,20}$/,
  transactionId: /^[A-Za-z0-9_-]{6,50}$/,
  name: /^[A-Za-z][A-Za-z .'-]{1,99}$/,
  captcha: /^[A-Z0-9]{6}$/
} as const;

export function required(value: unknown): boolean {
  return String(value ?? '').trim().length > 0;
}

export function validAmount(value: unknown, max = 500000): boolean {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= max;
}

export function validDateRange(from: string, to: string): boolean {
  if (!from || !to) return true;
  return new Date(from).getTime() <= new Date(to).getTime();
}

export function normalizeTransactionDirection(tx: any): 'OUTBOUND' | 'INBOUND' {
  if (!tx) return 'OUTBOUND';

  if (typeof tx === 'string') {
    const s = tx.trim().toUpperCase();
    if (['INBOUND', 'INWARD', 'IN', 'INCOMING', 'CREDIT', 'CR'].includes(s)) return 'INBOUND';
    if (['OUTBOUND', 'OUTWARD', 'OUT', 'OUTGOING', 'DEBIT', 'DR'].includes(s)) return 'OUTBOUND';
  }

  const candidates = [
    tx.direction,
    tx.transaction_direction,
    tx.direction_type,
    tx.directionType,
    tx.flow,
    tx.transaction_type,
    tx.transactionType,
    tx.type
  ];

  for (const val of candidates) {
    if (val && typeof val === 'string') {
      const normalized = val.trim().toUpperCase();
      if (['INBOUND', 'INWARD', 'IN', 'INCOMING', 'CREDIT', 'CR'].includes(normalized)) {
        return 'INBOUND';
      }
      if (['OUTBOUND', 'OUTWARD', 'OUT', 'OUTGOING', 'DEBIT', 'DR'].includes(normalized)) {
        return 'OUTBOUND';
      }
    }
  }

  if (tx.remitterName || tx.remitterAccount || tx.remitter_name || tx.remitter_account) {
    return 'INBOUND';
  }

  return 'OUTBOUND';
}

