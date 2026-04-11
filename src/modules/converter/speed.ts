const speedFactors = {
  kilometersPerHour: 1,
  milesPerHour: 1.609344,
  metersPerSecond: 3.6,
} as const;

export function convertSpeed(
  value: number,
  from: keyof typeof speedFactors,
  to: keyof typeof speedFactors,
) {
  const kmh = value * speedFactors[from];
  return kmh / speedFactors[to];
}

export { speedFactors };
