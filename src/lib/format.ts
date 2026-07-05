import { format, parseISO, isValid } from "date-fns";
import { ru } from "date-fns/locale";

export function formatDate(dateStr: string, shortMonth = false): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;

  if (shortMonth) {
    return format(date, "d MMMM", { locale: ru });
  }
  return format(date, "d MMMM, HH:mm", { locale: ru });
}

export function formatDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, "d MMM yyyy", { locale: ru });
}

export function daysUntil(dateStr: string): number {
  const date = parseISO(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
