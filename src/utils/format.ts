export function formatCompactNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat([], {
    maximumFractionDigits,
  }).format(value);
}

export function formatCurrency(
  value: number,
  currency: string,
  maximumFractionDigits = 2,
) {
  return new Intl.NumberFormat([], {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(value);
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

export function formatStopwatch(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const centiseconds = Math.floor((milliseconds % 1000) / 10)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}.${centiseconds}`;
}
