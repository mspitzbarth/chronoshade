// src/cronUtils.ts
// Helper utilities for parsing and evaluating cron expressions within ChronoShade

const DAY_OF_WEEK_ALIASES: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const MONTH_ALIASES: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

interface CronFieldOptions {
  aliases?: Record<string, number>;
  allowQuestionMark?: boolean;
  valueTransform?: (value: number) => number;
}

interface ParsedCronField {
  any: boolean;
  values: Set<number>;
}

interface ParsedCronExpression {
  minute: ParsedCronField;
  hour: ParsedCronField;
  dayOfMonth: ParsedCronField;
  month: ParsedCronField;
  dayOfWeek: ParsedCronField;
}

const FIELD_LIMITS = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 6 },
} as const;

const MAX_LOOKBACK_MINUTES = 366 * 24 * 60; // One year

export function validateCronExpression(expression: string): boolean {
  try {
    parseCronExpression(expression);
    return true;
  } catch {
    return false;
  }
}

export function getLastCronOccurrence(
  expression: string,
  referenceDate: Date,
  lookbackMinutes: number = MAX_LOOKBACK_MINUTES
): Date | null {
  const parsed = parseCronExpression(expression);
  const reference = new Date(referenceDate.getTime());
  reference.setSeconds(0, 0);

  for (let offset = 0; offset <= lookbackMinutes; offset++) {
    const candidate = new Date(reference.getTime() - offset * 60_000);
    if (matchesCron(candidate, parsed)) {
      return candidate;
    }
  }

  return null;
}

function parseCronExpression(expression: string): ParsedCronExpression {
  if (!expression) {
    throw new Error("Cron expression is empty");
  }

  const normalized = expression.trim().replace(/\s+/g, " ");
  const parts = normalized.split(" ");

  if (parts.length !== 5) {
    throw new Error("Cron expression must contain exactly 5 fields");
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  return {
    minute: parseCronField(minute, FIELD_LIMITS.minute.min, FIELD_LIMITS.minute.max),
    hour: parseCronField(hour, FIELD_LIMITS.hour.min, FIELD_LIMITS.hour.max),
    dayOfMonth: parseCronField(dayOfMonth, FIELD_LIMITS.dayOfMonth.min, FIELD_LIMITS.dayOfMonth.max, {
      allowQuestionMark: true,
    }),
    month: parseCronField(month, FIELD_LIMITS.month.min, FIELD_LIMITS.month.max, {
      aliases: MONTH_ALIASES,
    }),
    dayOfWeek: parseCronField(dayOfWeek, FIELD_LIMITS.dayOfWeek.min, FIELD_LIMITS.dayOfWeek.max, {
      aliases: DAY_OF_WEEK_ALIASES,
      allowQuestionMark: true,
      valueTransform: (value) => (value === 7 ? 0 : value),
    }),
  };
}

function parseCronField(
  field: string,
  min: number,
  max: number,
  options: CronFieldOptions = {}
): ParsedCronField {
  const raw = field.trim().toLowerCase();

  if (raw === "") {
    throw new Error("Cron field cannot be empty");
  }

  if (raw === "*" || (options.allowQuestionMark && raw === "?")) {
    return { any: true, values: new Set<number>() };
  }

  const values = new Set<number>();
  const segments = raw.split(",");

  for (const segment of segments) {
    processCronSegment(segment.trim(), min, max, options, values);
  }

  if (values.size === 0) {
    throw new Error("Cron field does not resolve to any concrete values");
  }

  return { any: false, values };
}

function processCronSegment(
  segment: string,
  min: number,
  max: number,
  options: CronFieldOptions,
  values: Set<number>
): void {
  if (segment === "") {
    throw new Error("Cron segment cannot be empty");
  }

  let rangePart = segment;
  let step = 1;

  if (segment.includes("/")) {
    const [base, stepValue] = segment.split("/");
    if (!stepValue) {
      throw new Error(`Invalid step syntax in cron segment: ${segment}`);
    }
    step = parseInt(stepValue, 10);
    if (!Number.isInteger(step) || step <= 0) {
      throw new Error(`Cron step must be a positive integer in segment: ${segment}`);
    }
    rangePart = base;
  }

  if (rangePart === "" || rangePart === "*") {
    fillRange(min, max, step, options, values);
    return;
  }

  if (rangePart.includes("-")) {
    const [startRaw, endRaw] = rangePart.split("-");
    if (startRaw === undefined || endRaw === undefined) {
      throw new Error(`Invalid range syntax in cron segment: ${segment}`);
    }

    const start = resolveCronValue(startRaw, min, max, options);
    const end = resolveCronValue(endRaw, min, max, options);

    if (end < start) {
      throw new Error(`Cron ranges must be ascending in segment: ${segment}`);
    }

    fillRange(start, end, step, options, values);
    return;
  }

  const value = resolveCronValue(rangePart, min, max, options);
  values.add(value);
}

function fillRange(
  start: number,
  end: number,
  step: number,
  options: CronFieldOptions,
  values: Set<number>
): void {
  for (let current = start; current <= end; current += step) {
    const transformed = options.valueTransform ? options.valueTransform(current) : current;
    values.add(transformed);
  }
}

function resolveCronValue(
  token: string,
  min: number,
  max: number,
  options: CronFieldOptions
): number {
  const normalizedToken = token.trim().toLowerCase();

  const aliasValue = options.aliases?.[normalizedToken];
  const resolved = aliasValue ?? Number.parseInt(normalizedToken, 10);

  if (!Number.isInteger(resolved)) {
    throw new Error(`Invalid cron value: ${token}`);
  }

  const transformed = options.valueTransform ? options.valueTransform(resolved) : resolved;

  if (transformed < min || transformed > max) {
    throw new Error(`Cron value out of range: ${token}`);
  }

  return transformed;
}

function matchesCron(date: Date, cron: ParsedCronExpression): boolean {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  if (!fieldMatches(cron.minute, minute)) {
    return false;
  }

  if (!fieldMatches(cron.hour, hour)) {
    return false;
  }

  if (!fieldMatches(cron.month, month)) {
    return false;
  }

  const domMatches = fieldMatches(cron.dayOfMonth, dayOfMonth);
  const dowMatches = fieldMatches(cron.dayOfWeek, dayOfWeek);

  let dayMatches: boolean;
  if (!cron.dayOfMonth.any && !cron.dayOfWeek.any) {
    dayMatches = domMatches || dowMatches;
  } else {
    dayMatches = (cron.dayOfMonth.any || domMatches) && (cron.dayOfWeek.any || dowMatches);
  }

  return dayMatches;
}

function fieldMatches(field: ParsedCronField, value: number): boolean {
  return field.any || field.values.has(value);
}

export function tryParseCronExpression(expression: string): ParsedCronExpression | null {
  try {
    return parseCronExpression(expression);
  } catch {
    return null;
  }
}

export function isCronDue(expression: string, date: Date): boolean {
  const parsed = tryParseCronExpression(expression);
  if (!parsed) {
    return false;
  }

  const minutePrecision = new Date(date.getTime());
  minutePrecision.setSeconds(0, 0);
  return matchesCron(minutePrecision, parsed);
}
