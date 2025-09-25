// Cron utility helpers embedded into the webview script (stringified JavaScript)

export const cronUtilsCode = `
const CHRONO_CRON_DAY_ALIASES = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6
};

const CHRONO_CRON_MONTH_ALIASES = {
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
    dec: 12
};

const CHRONO_CRON_FIELD_LIMITS = {
    minute: { min: 0, max: 59 },
    hour: { min: 0, max: 23 },
    dayOfMonth: { min: 1, max: 31 },
    month: { min: 1, max: 12 },
    dayOfWeek: { min: 0, max: 6 }
};

const CHRONO_MAX_LOOKBACK_MINUTES = 366 * 24 * 60;

function chronoValidateCronExpression(expression) {
    try {
        chronoParseCronExpression(expression);
        return true;
    } catch (error) {
        console.warn('[ChronoShade] Cron validation failed in webview:', error);
        return false;
    }
}

function chronoGetLastCronOccurrence(expression, referenceDate, lookbackMinutes = CHRONO_MAX_LOOKBACK_MINUTES) {
    const parsed = chronoParseCronExpression(expression);
    const reference = new Date(referenceDate.getTime());
    reference.setSeconds(0, 0);

    for (let offset = 0; offset <= lookbackMinutes; offset++) {
        const candidate = new Date(reference.getTime() - offset * 60000);
        if (chronoMatchesCron(candidate, parsed)) {
            return candidate;
        }
    }

    return null;
}

function chronoParseCronExpression(expression) {
    if (!expression) {
        throw new Error('Cron expression is empty');
    }

    const normalized = expression.trim().replace(/\s+/g, ' ');
    const parts = normalized.split(' ');

    if (parts.length !== 5) {
        throw new Error('Cron expression must contain exactly 5 fields');
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    return {
        minute: chronoParseCronField(minute, CHRONO_CRON_FIELD_LIMITS.minute.min, CHRONO_CRON_FIELD_LIMITS.minute.max, {}),
        hour: chronoParseCronField(hour, CHRONO_CRON_FIELD_LIMITS.hour.min, CHRONO_CRON_FIELD_LIMITS.hour.max, {}),
        dayOfMonth: chronoParseCronField(dayOfMonth, CHRONO_CRON_FIELD_LIMITS.dayOfMonth.min, CHRONO_CRON_FIELD_LIMITS.dayOfMonth.max, { allowQuestionMark: true }),
        month: chronoParseCronField(month, CHRONO_CRON_FIELD_LIMITS.month.min, CHRONO_CRON_FIELD_LIMITS.month.max, { aliases: CHRONO_CRON_MONTH_ALIASES }),
        dayOfWeek: chronoParseCronField(dayOfWeek, CHRONO_CRON_FIELD_LIMITS.dayOfWeek.min, CHRONO_CRON_FIELD_LIMITS.dayOfWeek.max, { aliases: CHRONO_CRON_DAY_ALIASES, allowQuestionMark: true, valueTransform: value => value === 7 ? 0 : value })
    };
}

function chronoParseCronField(field, min, max, options = {}) {
    const raw = field.trim().toLowerCase();

    if (raw === '') {
        throw new Error('Cron field cannot be empty');
    }

    if (raw === '*' || (options.allowQuestionMark && raw === '?')) {
        return { any: true, values: new Set() };
    }

    const values = new Set();
    const segments = raw.split(',');

    for (const segment of segments) {
        chronoProcessCronSegment(segment.trim(), min, max, options, values);
    }

    if (values.size === 0) {
        throw new Error('Cron field does not resolve to any concrete values');
    }

    return { any: false, values };
}

function chronoProcessCronSegment(segment, min, max, options, values) {
    if (segment === '') {
        throw new Error('Cron segment cannot be empty');
    }

    let rangePart = segment;
    let step = 1;

    if (segment.includes('/')) {
        const [base, stepValue] = segment.split('/');
        if (!stepValue) {
            throw new Error('Invalid step syntax in cron segment: ' + segment);
        }
        step = parseInt(stepValue, 10);
        if (!Number.isInteger(step) || step <= 0) {
            throw new Error('Cron step must be a positive integer in segment: ' + segment);
        }
        rangePart = base;
    }

    if (rangePart === '' || rangePart === '*') {
        chronoFillRange(min, max, step, options, values);
        return;
    }

    if (rangePart.includes('-')) {
        const [startRaw, endRaw] = rangePart.split('-');
        if (startRaw === undefined || endRaw === undefined) {
            throw new Error('Invalid range syntax in cron segment: ' + segment);
        }

        const start = chronoResolveCronValue(startRaw, min, max, options);
        const end = chronoResolveCronValue(endRaw, min, max, options);

        if (end < start) {
            throw new Error('Cron ranges must be ascending in segment: ' + segment);
        }

        chronoFillRange(start, end, step, options, values);
        return;
    }

    const value = chronoResolveCronValue(rangePart, min, max, options);
    values.add(value);
}

function chronoFillRange(start, end, step, options, values) {
    for (let current = start; current <= end; current += step) {
        const transformed = options.valueTransform ? options.valueTransform(current) : current;
        values.add(transformed);
    }
}

function chronoResolveCronValue(token, min, max, options) {
    const normalizedToken = token.trim().toLowerCase();

    const aliasValue = options.aliases && options.aliases[normalizedToken];
    const resolved = aliasValue !== undefined ? aliasValue : Number.parseInt(normalizedToken, 10);

    if (!Number.isInteger(resolved)) {
        throw new Error('Invalid cron value: ' + token);
    }

    const transformed = options.valueTransform ? options.valueTransform(resolved) : resolved;

    if (transformed < min || transformed > max) {
        throw new Error('Cron value out of range: ' + token);
    }

    return transformed;
}

function chronoMatchesCron(date, cron) {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    if (!chronoFieldMatches(cron.minute, minute)) {
        return false;
    }

    if (!chronoFieldMatches(cron.hour, hour)) {
        return false;
    }

    if (!chronoFieldMatches(cron.month, month)) {
        return false;
    }

    const domMatches = chronoFieldMatches(cron.dayOfMonth, dayOfMonth);
    const dowMatches = chronoFieldMatches(cron.dayOfWeek, dayOfWeek);

    let dayMatches;
    if (!cron.dayOfMonth.any && !cron.dayOfWeek.any) {
        dayMatches = domMatches || dowMatches;
    } else {
        dayMatches = (cron.dayOfMonth.any || domMatches) && (cron.dayOfWeek.any || dowMatches);
    }

    return dayMatches;
}

function chronoFieldMatches(field, value) {
    return field.any || field.values.has(value);
}
`;
