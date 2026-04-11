export function convertTemperature(
  value: number,
  from: 'celsius' | 'fahrenheit' | 'kelvin',
  to: 'celsius' | 'fahrenheit' | 'kelvin',
) {
  let celsius = value;

  if (from === 'fahrenheit') {
    celsius = ((value - 32) * 5) / 9;
  }

  if (from === 'kelvin') {
    celsius = value - 273.15;
  }

  if (to === 'celsius') {
    return celsius;
  }

  if (to === 'fahrenheit') {
    return (celsius * 9) / 5 + 32;
  }

  return celsius + 273.15;
}
