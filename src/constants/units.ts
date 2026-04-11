import type {
  ConverterCategory,
  CurrencyCode,
  TemperatureUnit,
  UnitOption,
} from '../types/converter.types';

export const converterCategories: Array<{
  key: ConverterCategory;
  label: string;
  subtitle: string;
}> = [
  { key: 'length', label: 'Length', subtitle: 'Distance and dimension' },
  { key: 'weight', label: 'Weight', subtitle: 'Mass and load' },
  { key: 'temperature', label: 'Temperature', subtitle: 'Heat scales' },
  { key: 'area', label: 'Area', subtitle: 'Surface measurements' },
  { key: 'speed', label: 'Speed', subtitle: 'Velocity units' },
  { key: 'currency', label: 'Currency', subtitle: 'Live and fallback rates' },
  {
    key: 'numberBase',
    label: 'Number Base',
    subtitle: 'Binary, octal, decimal and hexadecimal',
  },
];

export const lengthUnits: UnitOption[] = [
  { label: 'Kilometers', value: 'kilometer', symbol: 'km' },
  { label: 'Meters', value: 'meter', symbol: 'm' },
  { label: 'Centimeters', value: 'centimeter', symbol: 'cm' },
  { label: 'Millimeters', value: 'millimeter', symbol: 'mm' },
  { label: 'Miles', value: 'mile', symbol: 'mi' },
  { label: 'Feet', value: 'foot', symbol: 'ft' },
  { label: 'Inches', value: 'inch', symbol: 'in' },
];

export const weightUnits: UnitOption[] = [
  { label: 'Kilograms', value: 'kilogram', symbol: 'kg' },
  { label: 'Grams', value: 'gram', symbol: 'g' },
  { label: 'Pounds', value: 'pound', symbol: 'lb' },
  { label: 'Ounces', value: 'ounce', symbol: 'oz' },
  { label: 'Tonnes', value: 'tonne', symbol: 't' },
];

export const temperatureUnits: UnitOption<TemperatureUnit>[] = [
  { label: 'Celsius', value: 'celsius', symbol: '°C' },
  { label: 'Fahrenheit', value: 'fahrenheit', symbol: '°F' },
  { label: 'Kelvin', value: 'kelvin', symbol: 'K' },
];

export const areaUnits: UnitOption[] = [
  { label: 'Square meters', value: 'squareMeter', symbol: 'm²' },
  { label: 'Square kilometers', value: 'squareKilometer', symbol: 'km²' },
  { label: 'Acres', value: 'acre', symbol: 'ac' },
  { label: 'Hectares', value: 'hectare', symbol: 'ha' },
];

export const speedUnits: UnitOption[] = [
  { label: 'Kilometers / hour', value: 'kilometersPerHour', symbol: 'km/h' },
  { label: 'Miles / hour', value: 'milesPerHour', symbol: 'mph' },
  { label: 'Meters / second', value: 'metersPerSecond', symbol: 'm/s' },
];

export const currencyUnits: UnitOption<CurrencyCode>[] = [
  { label: 'US Dollar', value: 'USD', symbol: '$' },
  { label: 'Euro', value: 'EUR', symbol: '€' },
  { label: 'British Pound', value: 'GBP', symbol: '£' },
  { label: 'Nigerian Naira', value: 'NGN', symbol: '₦' },
  { label: 'Japanese Yen', value: 'JPY', symbol: '¥' },
  { label: 'Canadian Dollar', value: 'CAD', symbol: 'C$' },
  { label: 'Australian Dollar', value: 'AUD', symbol: 'A$' },
  { label: 'Indian Rupee', value: 'INR', symbol: '₹' },
];
