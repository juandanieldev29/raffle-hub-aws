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

export function range(start: number, stop: number, step: number) {
  return Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
}

export function replacer(key: string, value: string | null) {
  if (value === null) {
    return undefined;
  }
  return value;
}
