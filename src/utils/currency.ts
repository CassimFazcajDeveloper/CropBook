const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function formatMK(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  return `${sign}MK ${fmt.format(Math.abs(amount))}`;
}

export function formatQty(n: number): string {
  return fmt.format(n);
}

export function parseNumber(text: string): number | null {
  const cleaned = text.replace(/,/g, '').trim();
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function parseMoney(text: string): number | null {
  const n = parseNumber(text);
  return n === null ? null : Math.round(n);
}
