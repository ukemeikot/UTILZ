const lengthFactors = {
  kilometer: 1000,
  meter: 1,
  centimeter: 0.01,
  millimeter: 0.001,
  mile: 1609.344,
  foot: 0.3048,
  inch: 0.0254,
} as const;

export function convertLength(
  value: number,
  from: keyof typeof lengthFactors,
  to: keyof typeof lengthFactors,
) {
  const meters = value * lengthFactors[from];
  return meters / lengthFactors[to];
}

export { lengthFactors };
