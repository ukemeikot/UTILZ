export type ConverterCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'area'
  | 'speed'
  | 'currency'
  | 'numberBase';

export type BasicConverterCategory = Exclude<
  ConverterCategory,
  'temperature' | 'currency' | 'numberBase'
>;

export type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin';

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'NGN'
  | 'JPY'
  | 'CAD'
  | 'AUD'
  | 'INR';

export type ConverterUnit =
  | 'kilometer'
  | 'meter'
  | 'centimeter'
  | 'millimeter'
  | 'mile'
  | 'foot'
  | 'inch'
  | 'kilogram'
  | 'gram'
  | 'pound'
  | 'ounce'
  | 'tonne'
  | TemperatureUnit
  | 'squareMeter'
  | 'squareKilometer'
  | 'acre'
  | 'hectare'
  | 'kilometersPerHour'
  | 'milesPerHour'
  | 'metersPerSecond'
  | CurrencyCode;

export type UnitOption<TValue extends string = ConverterUnit> = {
  label: string;
  value: TValue;
  symbol: string;
};

export type ConverterResult = {
  label: string;
  symbol: string;
  value: number;
};

export type CurrencyRates = Record<CurrencyCode, number>;
