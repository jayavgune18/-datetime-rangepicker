import { addDays, format, isBefore, isAfter, differenceInMilliseconds } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export const getZonedDate = (year: number, month: number, day: number, tz: string): Date => {
  const date = new Date(year, month, day, 12, 0, 0); // Noon to avoid DST issues
  return zonedTimeToUtc(date, tz);
};

export const getCalendarDays = (year: number, month: number, tz: string): Date[] => {
  const monthStart = getZonedDate(year, month, 1, tz);
  const nextMonth = month + 1 > 11 ? 0 : month + 1;
  const nextYear = month + 1 > 11 ? year + 1 : year;
  const monthEnd = getZonedDate(nextYear, nextMonth, 0, tz);
  const days: Date[] = [];
  let current = monthStart;
  while (current <= monthEnd) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
};

export const formatInTimezone = (date: Date, tz: string, formatStr: string): string => {
  return format(utcToZonedTime(date, tz), formatStr);
};

export const isDateDisabled = (date: Date, constraints: Constraints | undefined, tz: string): boolean => {
  if (!constraints) return false;
  const zonedDate = utcToZonedTime(date, tz);
  if (constraints.min && isBefore(zonedDate, constraints.min)) return true;
  if (constraints.max && isAfter(zonedDate, constraints.max)) return true;
  if (constraints.blackouts) {
    return constraints.blackouts.some(blackout => formatInTimezone(date, tz, 'yyyy-MM-dd') === formatInTimezone(blackout, tz, 'yyyy-MM-dd'));
  }
  return false;
};

export const validateRange = (start: Date | null, end: Date | null, constraints: Constraints | undefined): string | null => {
  if (!start || !end || !constraints) return null;
  const duration = differenceInMilliseconds(end, start);
  if (constraints.minDuration && duration < constraints.minDuration) {
    return `Duration must be at least ${constraints.minDuration / 1000 / 60} minutes`;
  }
  if (constraints.maxDuration && duration > constraints.maxDuration) {
    return `Duration must be at most ${constraints.maxDuration / 1000 / 60} minutes`;
  }
  return null;
};