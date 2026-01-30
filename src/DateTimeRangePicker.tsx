import React, { useState, useRef, useEffect } from 'react';
import { addMonths, subMonths, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { DateTimeRange, Constraints, Preset } from './types';
import { getCalendarDays, formatInTimezone, isDateDisabled, validateRange } from './utils';

interface DateTimeRangePickerProps {
  value: DateTimeRange;
  onChange: (value: DateTimeRange) => void;
  constraints?: Constraints;
  presets?: Preset[];
}

const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  value,
  onChange,
  constraints,
  presets = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState({ hour: 0, minute: 0 });
  const [endTime, setEndTime] = useState({ hour: 23, minute: 59 });
  const [error, setError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const tz = value.timezone;
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const calendarDays = getCalendarDays(year, month, tz);

  // Calculate grid start (Monday as first day)
  const firstDay = calendarDays[0];
  const firstDayOfWeek = new Intl.DateTimeFormat('en', { timeZone: tz, weekday: 'narrow' }).format(firstDay);
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const startIndex = weekDays.indexOf(firstDayOfWeek);

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date, constraints, tz)) return;
    let newStart = value.start;
    let newEnd = value.end;
    if (!value.start) {
      newStart = date;
    } else if (!value.end) {
      newEnd = date;
      if (isBefore(newEnd, newStart)) {
        [newStart, newEnd] = [newEnd, newStart];
      }
    } else {
      newStart = date;
      newEnd = null;
    }
    const validationError = validateRange(newStart, newEnd, constraints);
    setError(validationError);
    if (!validationError) {
      onChange({ ...value, start: newStart, end: newEnd });
    }
  };

  const handleTimeChange = (type: 'start' | 'end', field: 'hour' | 'minute', val: number) => {
    if (type === 'start') {
      setStartTime({ ...startTime, [field]: val });
    } else {
      setEndTime({ ...endTime, [field]: val });
    }
    // Update the range with new time
    const newValue = { ...value };
    if (newValue.start) {
      const zoned = utcToZonedTime(newValue.start, tz);
      zoned.setHours(type === 'start' ? val : zoned.getHours(), type === 'start' ? startTime.minute : val);
      newValue.start = zonedTimeToUtc(zoned, tz);
    }
    if (newValue.end) {
      const zoned = utcToZonedTime(newValue.end, tz);
      zoned.setHours(type === 'end' ? val : zoned.getHours(), type === 'end' ? endTime.minute : val);
      newValue.end = zonedTimeToUtc(zoned, tz);
    }
    const validationError = validateRange(newValue.start, newValue.end, constraints);
    setError(validationError);
    if (!validationError) {
      onChange(newValue);
    }
  };

  const handlePresetSelect = (preset: Preset) => {
    const now = new Date();
    const range = preset.getRange(now, tz);
    onChange({ ...value, ...range });
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focusedDate) return;
    let newFocused = focusedDate;
    switch (e.key) {
      case 'ArrowLeft':
        newFocused = addDays(focusedDate, -1);
        break;
      case 'ArrowRight':
        newFocused = addDays(focusedDate, 1);
        break;
      case 'ArrowUp':
        newFocused = addDays(focusedDate, -7);
        break;
      case 'ArrowDown':
        newFocused = addDays(focusedDate, 7);
        break;
      case 'Enter':
        handleDateSelect(focusedDate);
        return;
      default:
        return;
    }
    e.preventDefault();
    setFocusedDate(newFocused);
  };

  useEffect(() => {
    if (focusedDate && gridRef.current) {
      const cell = gridRef.current.querySelector(`[data-date="${focusedDate.toISOString()}"]`) as HTMLElement;
      cell?.focus();
    }
  }, [focusedDate]);

  const isInRange = (date: Date) => {
    if (!value.start || !value.end) return false;
    return date >= value.start && date <= value.end;
  };

  const isRangeStart = (date: Date) => value.start && isSameDay(date, value.start);
  const isRangeEnd = (date: Date) => value.end && isSameDay(date, value.end);

  return (
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          value={tz}
          onChange={(e) => onChange({ ...value, timezone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
        </select>
      </div>

      {presets.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            Prev
          </button>
          <span className="text-lg font-semibold text-gray-800">
            {formatInTimezone(calendarDays[0], tz, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            Next
          </button>
        </div>
        <div
          ref={gridRef}
          role="grid"
          aria-label="Date picker"
          onKeyDown={handleKeyDown}
          className="grid grid-cols-7 gap-1"
        >
          {weekDays.map((day) => (
            <div key={day} role="columnheader" className="p-3 text-center font-medium text-gray-600">
              {day}
            </div>
          ))}
          {Array.from({ length: startIndex }, (_, i) => (
            <div key={`empty-${i}`} className="p-3"></div>
          ))}
          {calendarDays.map((date) => {
            const disabled = isDateDisabled(date, constraints, tz);
            const inRange = isInRange(date);
            const isStart = isRangeStart(date);
            const isEnd = isRangeEnd(date);
            return (
              <button
                key={date.toISOString()}
                data-date={date.toISOString()}
                role="gridcell"
                aria-selected={inRange}
                disabled={disabled}
                onClick={() => handleDateSelect(date)}
                onFocus={() => setFocusedDate(date)}
                className={`p-3 text-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : inRange
                    ? 'bg-blue-100 text-gray-900'
                    : 'hover:bg-gray-50 text-gray-900'
                } ${isStart || isEnd ? 'bg-primary text-white' : ''}`}
              >
                {formatInTimezone(date, tz, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="23"
            value={startTime.hour}
            onChange={(e) => handleTimeChange('start', 'hour', parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Start hour"
          />
          <input
            type="number"
            min="0"
            max="59"
            value={startTime.minute}
            onChange={(e) => handleTimeChange('start', 'minute', parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Start minute"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="23"
            value={endTime.hour}
            onChange={(e) => handleTimeChange('end', 'hour', parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="End hour"
          />
          <input
            type="number"
            min="0"
            max="59"
            value={endTime.minute}
            onChange={(e) => handleTimeChange('end', 'minute', parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="End minute"
          />
        </div>
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <div className="text-sm text-gray-600">
        Selected: {value.start ? formatInTimezone(value.start, tz, 'PPpp') : 'None'} - {value.end ? formatInTimezone(value.end, tz, 'PPpp') : 'None'}
      </div>
    </div>
  );
};

export default DateTimeRangePicker;