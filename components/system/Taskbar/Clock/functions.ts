export type LocaleTimeDate = {
  date: string;
  time: string;
};

const DEFAULT_LOCALE = "en";

type Formatters = {
  dateFormatter: Intl.DateTimeFormat;
  dayFormatter: Intl.DateTimeFormat;
  timeFormatter: Intl.DateTimeFormat;
};

const formatters = new Map<string, Formatters>();

const getFormatters = (locale = DEFAULT_LOCALE): Formatters => {
  const normalizedLocale = locale || DEFAULT_LOCALE;
  const cachedFormatters = formatters.get(normalizedLocale);

  if (cachedFormatters) {
    return cachedFormatters;
  }

  const nextFormatters = {
    dateFormatter: new Intl.DateTimeFormat(normalizedLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    dayFormatter: new Intl.DateTimeFormat(normalizedLocale, {
      weekday: "long",
    }),
    timeFormatter: new Intl.DateTimeFormat(normalizedLocale, {
      hour: "numeric",
      hour12: true,
      minute: "2-digit",
      second: "2-digit",
    }),
  };

  formatters.set(normalizedLocale, nextFormatters);

  return nextFormatters;
};

export const formatLocaleDateTime = (
  now: Date,
  locale = DEFAULT_LOCALE
): LocaleTimeDate => {
  const { dateFormatter, dayFormatter, timeFormatter } = getFormatters(locale);
  const date = dateFormatter.format(now);
  const day = dayFormatter.format(now);
  const time = timeFormatter.format(now);

  return {
    date: `${date}\n${day}`,
    time,
  };
};

export const CLOCK_TEXT_HEIGHT_OFFSET = 1;
