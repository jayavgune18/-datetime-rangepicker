export type DateTimeRange = {
  start: Date | null;
  end: Date | null;
  timezone: string;
};

export type Constraints = {
  min?: Date;
  max?: Date;
  blackouts?: Date[];
  minDuration?: number; // in milliseconds
  maxDuration?: number; // in milliseconds
};

export type Preset = {
  label: string;
  getRange: (now: Date, tz: string) => { start: Date; end: Date };
};