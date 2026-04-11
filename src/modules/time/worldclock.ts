export type HourFormat = '24h' | '12h';

export type WorldClockZone = {
  city: string;
  country: string;
  zone: string;
  utcLabel: string;
};

export type TimeConversionZone = {
  label: string;
  zone: string;
  utcLabel: string;
};

export type Meridiem = 'AM' | 'PM';

export const worldClockZones: WorldClockZone[] = [
  {
    city: 'Lagos',
    country: 'Nigeria',
    zone: 'Africa/Lagos',
    utcLabel: 'UTC +1',
  },
  {
    city: 'London',
    country: 'United Kingdom',
    zone: 'Europe/London',
    utcLabel: 'UTC 0',
  },
  {
    city: 'Paris',
    country: 'France',
    zone: 'Europe/Paris',
    utcLabel: 'UTC +1',
  },
  {
    city: 'New York',
    country: 'United States',
    zone: 'America/New_York',
    utcLabel: 'UTC -5',
  },
  {
    city: 'Los Angeles',
    country: 'United States',
    zone: 'America/Los_Angeles',
    utcLabel: 'UTC -8',
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    zone: 'Asia/Tokyo',
    utcLabel: 'UTC +9',
  },
];

export const timeConversionZones: TimeConversionZone[] = [
  { label: 'UTC', zone: 'Etc/UTC', utcLabel: 'UTC 0' },
  { label: 'GMT', zone: 'Etc/GMT', utcLabel: 'UTC 0' },
  { label: 'WAT', zone: 'Africa/Lagos', utcLabel: 'UTC +1' },
  { label: 'CET', zone: 'Europe/Paris', utcLabel: 'UTC +1' },
  { label: 'EET', zone: 'Europe/Athens', utcLabel: 'UTC +2' },
  { label: 'EST', zone: 'America/New_York', utcLabel: 'UTC -5' },
  { label: 'PST', zone: 'America/Los_Angeles', utcLabel: 'UTC -8' },
  { label: 'JST', zone: 'Asia/Tokyo', utcLabel: 'UTC +9' },
];

type ZoneDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getZoneDateParts(zone: string, date = new Date()): ZoneDateParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<string, number>;

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function getTimeZoneOffset(zone: string, date = new Date()) {
  const parts = getZoneDateParts(zone, date);
  const asUtcTimestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return (asUtcTimestamp - date.getTime()) / 60000;
}

function buildDateInZone(
  zone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const firstOffset = getTimeZoneOffset(zone, new Date(utcGuess));
  let corrected = utcGuess - firstOffset * 60_000;
  const secondOffset = getTimeZoneOffset(zone, new Date(corrected));

  if (secondOffset !== firstOffset) {
    corrected = utcGuess - secondOffset * 60_000;
  }

  return new Date(corrected);
}

function normalizeHour(hour: number, meridiem: Meridiem, format: HourFormat) {
  if (format === '24h') {
    return Math.max(0, Math.min(23, hour));
  }

  const safeHour = Math.max(1, Math.min(12, hour));
  const baseHour = safeHour % 12;
  return meridiem === 'PM' ? baseHour + 12 : baseHour;
}

export function getWorldHour(zone: string) {
  return getZoneDateParts(zone).hour;
}

export function getWorldPeriod(zone: string) {
  const hour = getWorldHour(zone);

  if (hour >= 6 && hour < 18) {
    return {
      label: 'Day',
      icon: '\u2600',
    };
  }

  return {
    label: 'Night',
    icon: '\u263e',
  };
}

export function formatWorldTime(
  zone: string,
  format: HourFormat = '24h',
  date = new Date(),
) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: format === '12h',
    timeZone: zone,
  });

  return formatter.format(date);
}

export function formatWorldDate(zone: string, date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: zone,
  });

  return formatter.format(date);
}

export function convertTimeBetweenZones(input: {
  fromZone: string;
  toZone: string;
  hour: number;
  minute: number;
  meridiem: Meridiem;
  format: HourFormat;
}) {
  const { fromZone, toZone, hour, minute, meridiem, format } = input;
  const referenceDate = getZoneDateParts(fromZone);
  const normalizedHour = normalizeHour(hour, meridiem, format);
  const normalizedMinute = Math.max(0, Math.min(59, minute));
  const sourceDate = buildDateInZone(
    fromZone,
    referenceDate.year,
    referenceDate.month,
    referenceDate.day,
    normalizedHour,
    normalizedMinute,
  );

  return {
    sourceTime: formatWorldTime(fromZone, format, sourceDate),
    targetTime: formatWorldTime(toZone, format, sourceDate),
    targetDate: formatWorldDate(toZone, sourceDate),
  };
}
