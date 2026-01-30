import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateTimeRangePicker from '../src/DateTimeRangePicker';
import { DateTimeRange } from '../src/types';

const mockValue: DateTimeRange = {
  start: null,
  end: null,
  timezone: 'America/New_York',
};

test('renders calendar grid', () => {
  render(<DateTimeRangePicker value={mockValue} onChange={() => {}} />);
  expect(screen.getByRole('grid')).toBeInTheDocument();
});

test('keyboard navigation selects date', async () => {
  const user = userEvent.setup();
  const mockOnChange = jest.fn();
  render(<DateTimeRangePicker value={mockValue} onChange={mockOnChange} />);
  const grid = screen.getByRole('grid');
  await user.tab();
  expect(grid).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(mockOnChange).toHaveBeenCalled();
});

test('validates constraints', () => {
  const constraints = { min: new Date('2023-01-01') };
  render(<DateTimeRangePicker value={mockValue} onChange={() => {}} constraints={constraints} />);
  // Assume a date before min is disabled
  const disabledButton = screen.getByText('1'); // Example
  expect(disabledButton).toBeDisabled();
});

// Add more tests for a11y, DST, etc.