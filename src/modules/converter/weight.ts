const weightFactors = {
  kilogram: 1,
  gram: 0.001,
  pound: 0.45359237,
  ounce: 0.028349523125,
  tonne: 1000,
} as const;

export function convertWeight(
  value: number,
  from: keyof typeof weightFactors,
  to: keyof typeof weightFactors,
) {
  const kilograms = value * weightFactors[from];
  return kilograms / weightFactors[to];
}

export { weightFactors };
