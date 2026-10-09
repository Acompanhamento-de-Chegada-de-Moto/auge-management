export function parseDateStringDDMMAAAA(value: string | null): Date | null {
  if (!value?.trim()) {
    return null;
  }

  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  const date = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber, 3));

  const isValidDate =
    date.getUTCDate() === dayNumber &&
    date.getUTCMonth() === monthNumber - 1 &&
    date.getUTCFullYear() === yearNumber;

  return isValidDate ? date : null;
}
