import type { CurrencyCode, CurrencyRates } from '../../types/converter.types';

export const fallbackCurrencyRates: CurrencyRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1540,
  JPY: 151.4,
  CAD: 1.38,
  AUD: 1.52,
  INR: 83.2,
};

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: CurrencyRates = fallbackCurrencyRates,
) {
  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    return amount;
  }

  const amountInUsd = amount / fromRate;
  return amountInUsd * toRate;
}

export function normalizeFrankfurterRates(
  base: CurrencyCode,
  rates: Partial<Record<CurrencyCode, number>>,
): CurrencyRates {
  const merged = {
    ...fallbackCurrencyRates,
    ...rates,
    [base]: 1,
  };

  return merged;
}
