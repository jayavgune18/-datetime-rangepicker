import React, { useState } from 'react';
import DateTimeRangePicker from './DateTimeRangePicker';
import { DateTimeRange } from './types';

const App: React.FC = () => {
  const [value, setValue] = useState<DateTimeRange>({
    start: null,
    end: null,
    timezone: 'America/New_York',
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">DateTimeRangePicker Demo</h1>
      <DateTimeRangePicker
        value={value}
        onChange={setValue}
        constraints={{
          min: new Date('2023-01-01'),
          max: new Date(),
        }}
        presets={[
          {
            label: 'Last 24h',
            getRange: (now) => ({ start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now }),
          },
        ]}
      />
    </div>
  );
};

export default App;