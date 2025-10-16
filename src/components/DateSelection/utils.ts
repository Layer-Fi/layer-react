import {
  startOfDay, endOfDay,
  startOfMonth, endOfMonth, addMonths, subMonths,
  startOfQuarter, endOfQuarter, addQuarters, subQuarters,
  startOfYear, endOfYear, addYears, subYears,
  isEqual,
} from 'date-fns'
import { clampToAfterActivationDate, clampToPresentOrPast, type DateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

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
  Custom = 'Custom',

}

const PRESET_ARGS = {
  [DatePreset.ThisMonth]: [Period.Month, 0],
  [DatePreset.LastMonth]: [Period.Month, -1],
  [DatePreset.ThisQuarter]: [Period.Quarter, 0],
  [DatePreset.LastQuarter]: [Period.Quarter, -1],
  [DatePreset.ThisYear]: [Period.Year, 0],
  [DatePreset.LastYear]: [Period.Year, -1],
} satisfies Record<Exclude<DatePreset, 'Custom'>, readonly [Period, number]>

function typedEntries<T extends Record<PropertyKey, unknown>>(obj: T) {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

function fromEntriesStrict<K extends PropertyKey, V>(
  entries: Iterable<readonly [K, V]>,
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>
}

export function rangeForPreset(preset: Exclude<DatePreset, 'Custom'>, base?: Date): DateRange {
  const args = PRESET_ARGS[preset]
  const [period, offset] = args
  return rangeFor(period, offset, base)
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

export function presetForDateRange(input: DateRange, selectedPreset: DatePreset | null = null, activationDate?: Date): DatePreset | null {
  const range = normalize(input, activationDate)

  const candidates: Record<keyof typeof PRESET_ARGS, DateRange> = fromEntriesStrict(
    typedEntries(PRESET_ARGS).map(([key, [period, offset]]) => [
      key,
      normalize(rangeFor(period, offset), activationDate),
    ]),
  )

  if (selectedPreset !== null && selectedPreset !== DatePreset.Custom) {
    if (sameDateRange(range, candidates[selectedPreset])) return selectedPreset
  }

  for (const [preset, fixedRange] of Object.entries(candidates)) {
    if (sameDateRange(range, fixedRange)) return preset as DatePreset
  }

  return null
}
