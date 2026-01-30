# API Documentation

## DateTimeRangePicker Props
- `value: DateTimeRange` - Current range state.
- `onChange: (value: DateTimeRange) => void` - Callback for changes.
- `constraints?: Constraints` - Optional min/max/blackouts/duration.
- `presets?: Preset[]` - Optional quick-select presets.

## Usage Example
```tsx
<DateTimeRangePicker
  value={{ start: null, end: null, timezone: 'UTC' }}
  onChange={setValue}
  constraints={{ min: new Date() }}
/>