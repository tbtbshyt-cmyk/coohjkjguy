import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, currency: 'YER' | 'SAR' | 'USD' = 'YER') {
  const rounded = Math.round(amount);
  if (currency === 'USD') return `$${rounded.toLocaleString('en-US')}`;
  if (currency === 'SAR') return `${rounded.toLocaleString('ar-EG')} ر.س`;
  return `${rounded.toLocaleString('ar-EG')} ر.ي`;
}

export function convert(amount: number, currency: string, rates: { YER: number; SAR: number; USD: number }) {
  return amount * (rates as any)[currency];
}