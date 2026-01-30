import { getCalendarDays, isDateDisabled, validateRange } from '../src/utils';
import { addDays } from 'date-fns';

test('getCalendarDays returns correct days', () => {
  const days = getCalendarDays(2023, 0, 'UTC'); // Jan 2023
  expect(days.length).toBeGreaterThan(28);
});

test('isDateDisabled respects constraints', () => {
  const constraints = { min: new Date('2023-01-01') };
  expect(isDateDisabled(new Date('2022-01-01'), constraints, 'UTC')).toBe(true);
});

test('validateRange checks duration', () => {
  const constraints = { minDuration: 1000 * 60 * 60 };
  const error = validateRange(new Date(), addDays(new Date(), 1), constraints);
  expect(error).toBeNull();
});

