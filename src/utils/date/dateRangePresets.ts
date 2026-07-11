import {
  addMonths, addQuarters, addYears, endOfDay,
  endOfMonth, endOfQuarter, endOfYear, isEqual,
  startOfDay, startOfMonth, startOfQuarter, startOfYear, subMonths,
  subQuarters,
  subYears,
} from 'date-fns'

import { clampToAfterActivationDate, clampToPresentOrPast, correctDateRange, type DateRange } from '@utils/date/dateRange'

export enum Period {
  Month = 'Month',
  Quarter = 'Quarter',
  Year = 'Year',
}

const PERIOD_FNS: Record<Period, {
  startOf(d: Date): Date
  endOf(d: Date): Date
  add(d: Date, n: number): Date
  sub(d: Date, n: number): Date
}> = {
  [Period.Month]: {
    startOf: startOfMonth,
    endOf: endOfMonth,
    add: addMonths,
    sub: subMonths,
  },
  [Period.Quarter]: {
    startOf: startOfQuarter,
    endOf: endOfQuarter,
    add: addQuarters,
    sub: subQuarters,
  },
  [Period.Year]: {
    startOf: startOfYear,
    endOf: endOfYear,
    add: addYears,
    sub: subYears,
  },
}

export function rangeFor(period: Period, offset = 0, base: Date = new Date()): DateRange {
  const f = PERIOD_FNS[period]
  const shifted = offset === 0
    ? base
    : offset > 0
      ? f.add(base, offset)
      : f.sub(base, Math.abs(offset))
  const startDate = f.startOf(shifted)
  return { startDate, endDate: f.endOf(startDate) }
}

export enum DatePreset {
  ThisMonth = 'ThisMonth',
  LastMonth = 'LastMonth',
  ThisQuarter = 'ThisQuarter',
  LastQuarter = 'LastQuarter',
  ThisYear = 'ThisYear',
  LastYear = 'LastYear',
  /**
   * Clamped to the business activation date (start) and the present (end).
   * Unlike the other presets, its range cannot be resolved from `now` alone —
   * it requires the business context. See `useResolvedInitialRange`.
   */
  AllTime = 'AllTime',
  /*
  * The custom preset cannot be selected directly by the user. It can only be set by the store if
  * the user sets a date range that is not one of the other presets.
  */
  Custom = 'Custom',

}

// A date preset that can be computed from `now` alone.
export type RelativeDatePreset = Exclude<DatePreset, DatePreset.Custom | DatePreset.AllTime>
// A date preset that can be selected directly by the user.
export type SelectableDatePreset = Exclude<DatePreset, DatePreset.Custom>

const RELATIVE_DATE_PRESET_ARGS = {
  [DatePreset.ThisMonth]: [Period.Month, 0],
  [DatePreset.LastMonth]: [Period.Month, -1],
  [DatePreset.ThisQuarter]: [Period.Quarter, 0],
  [DatePreset.LastQuarter]: [Period.Quarter, -1],
  [DatePreset.ThisYear]: [Period.Year, 0],
  [DatePreset.LastYear]: [Period.Year, -1],
} satisfies Record<RelativeDatePreset, readonly [Period, number]>

function typedEntries<T extends Record<PropertyKey, unknown>>(obj: T) {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

function fromEntriesStrict<K extends PropertyKey, V>(
  entries: Iterable<readonly [K, V]>,
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>
}

export function rangeForPreset(preset: RelativeDatePreset, base?: Date): DateRange {
  const args = RELATIVE_DATE_PRESET_ARGS[preset]
  const [period, offset] = args
  return rangeFor(period, offset, base)
}

/**
 * The `AllTime` range: from the business activation date to the present. Unlike
 * `rangeForPreset` this needs the activation date, so it is resolved wherever the
 * business context is available (the store resolver and the preset combo box).
 */
export function rangeForAllTime(activationDate: Date): DateRange {
  return correctDateRange({
    startDate: startOfDay(activationDate),
    endDate: endOfDay(new Date()),
  })
}

const normalize = (range: DateRange, activationDate?: Date | null): DateRange => {
  const rawStartDate = startOfDay(range.startDate)
  const rawEndDate = endOfDay(range.endDate)

  return {
    startDate: activationDate ? clampToAfterActivationDate(rawStartDate, startOfDay(activationDate)) : rawStartDate,
    endDate: clampToPresentOrPast(rawEndDate),
  }
}

const sameDateRange = (a: DateRange, b: DateRange) =>
  !!a.startDate && !!b.startDate && !!a.endDate && !!b.endDate
  && isEqual(startOfDay(a.startDate), startOfDay(b.startDate))
  && isEqual(endOfDay(a.endDate), endOfDay(b.endDate))

export function deriveRelativePresetFromDateRange(input: DateRange, selectedPreset: DatePreset | null = null, activationDate?: Date): DatePreset | null {
  const range = normalize(input, activationDate)

  const relativeDateCandidates: Record<keyof typeof RELATIVE_DATE_PRESET_ARGS, DateRange> = fromEntriesStrict(
    typedEntries(RELATIVE_DATE_PRESET_ARGS).map(([key, [period, offset]]) => [
      key,
      normalize(rangeFor(period, offset), activationDate),
    ]),
  )

  // AllTime is not a relative candidate (its range needs context), so it can't be
  // derived here — a caller that tracks the stored preset supplies it directly.
  if (selectedPreset !== null && selectedPreset !== DatePreset.Custom && selectedPreset !== DatePreset.AllTime) {
    if (sameDateRange(range, relativeDateCandidates[selectedPreset])) return selectedPreset
  }

  for (const [preset, fixedRange] of Object.entries(relativeDateCandidates)) {
    if (sameDateRange(range, fixedRange)) return preset as DatePreset
  }

  return null
}

/**
 * Derives a concrete date range given a date preset. Relative presets are pure functions of
 * `now`; `AllTime` needs the business activation date and returns `null` when it
 * isn't available yet (so callers can defer/skip rather than show a wrong range).
 */
export function deriveDateRangeFromPreset(
  preset: Exclude<DatePreset, DatePreset.Custom>,
  activationDate?: Date,
): DateRange | null {
  if (preset === DatePreset.AllTime) {
    return activationDate ? rangeForAllTime(activationDate) : null
  }
  return rangeForPreset(preset)
}

/**
 * Derives the preset a range represents: `AllTime` when it spans activation→present,
 * otherwise a matching relative preset, otherwise `Custom`. `previousPreset` keeps a
 * selection sticky when a range matches more than one candidate.
 */
export function derivePresetFromDateRange(
  input: DateRange,
  previousPreset: DatePreset | null = null,
  activationDate?: Date,
): DatePreset {
  if (activationDate && sameDateRange(normalize(input, activationDate), normalize(rangeForAllTime(activationDate), activationDate))) {
    return DatePreset.AllTime
  }
  const relativePreset = deriveRelativePresetFromDateRange(input, previousPreset, activationDate)

  if (relativePreset) {
    return relativePreset
  }

  if (activationDate && sameDateRange(normalize(input, activationDate), normalize(rangeForAllTime(activationDate), activationDate))) {
    return DatePreset.AllTime
  }

  return DatePreset.Custom
}
