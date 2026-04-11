import { useEffect, useState } from 'react';

import {
  fallbackCurrencyRates,
  normalizeFrankfurterRates,
} from '../modules/converter/currency';
import type { CurrencyCode, CurrencyRates } from '../types/converter.types';
import { useNetwork } from './useNetwork';

export function useCurrency(base: CurrencyCode = 'USD') {
  const [rates, setRates] = useState<CurrencyRates>(fallbackCurrencyRates);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'live' | 'offline'>('offline');
  const isConnected = useNetwork();

  useEffect(() => {
    let active = true;

    async function loadRates() {
      if (!isConnected) {
        setRates(fallbackCurrencyRates);
        setSource('offline');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `https://api.frankfurter.app/latest?from=${base}`,
        );
        const data = await response.json();

        if (active && data?.rates) {
          setRates(normalizeFrankfurterRates(base, data.rates));
          setSource('live');
        }
      } catch {
        if (active) {
          setRates(fallbackCurrencyRates);
          setSource('offline');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRates();

    return () => {
      active = false;
    };
  }, [base, isConnected]);

  return {
    rates,
    loading,
    source,
  };
}
