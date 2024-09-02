export function formatMinimumIntegerDigits(number: number) {
  return number.toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false });
}

export function formatNumber(number: number) {
  const formatter = new Intl.NumberFormat();
  return formatter.format(number);
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function range(start: number, stop: number, step: number, includeFirstItem = true) {
  return Array.from(
    { length: (stop - start) / step + (includeFirstItem ? 1 : 0) },
    (_, i) => start + i * step,
  );
}

export function replacer(_: string, value: string | null) {
  if (value === null) {
    return undefined;
  }
  return value;
}

export function differenceInDays(firstDate: Date, secondDate: Date) {
  const differenceInDays = secondDate.getTime() - firstDate.getTime();
  return Math.round(differenceInDays / (1000 * 3600 * 24));
}
