const areaFactors = {
  squareMeter: 1,
  squareKilometer: 1_000_000,
  acre: 4046.8564224,
  hectare: 10_000,
} as const;

export function convertArea(
  value: number,
  from: keyof typeof areaFactors,
  to: keyof typeof areaFactors,
) {
  const squareMeters = value * areaFactors[from];
  return squareMeters / areaFactors[to];
}

export { areaFactors };
