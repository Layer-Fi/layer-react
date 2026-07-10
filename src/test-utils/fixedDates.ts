// Fixed dates for tests that pin the clock with setupFakeSystemTime(NOW).
export const NOW = new Date(2026, 5, 15, 12, 0, 0)
export const END_OF_TODAY = new Date(2026, 5, 15, 23, 59, 59, 999)

export const ONE_MONTH_BEFORE_NOW = new Date(2026, 4, 15, 12, 0, 0)
export const TWO_MONTHS_BEFORE_NOW = new Date(2026, 3, 15, 12, 0, 0)
export const THREE_MONTHS_BEFORE_NOW = new Date(2026, 2, 15, 12, 0, 0)
export const FIVE_MONTHS_BEFORE_NOW = new Date(2026, 0, 15, 12, 0, 0)
export const SIX_MONTHS_AFTER_NOW = new Date(2026, 11, 15, 12, 0, 0)
export const TWO_YEARS_BEFORE_NOW = new Date(2024, 5, 15, 12, 0, 0)

export const CURRENT_MONTH_TO_DATE = {
  startDate: new Date(2026, 5, 1),
  endDate: END_OF_TODAY,
}

export const CURRENT_YEAR_TO_DATE = {
  startDate: new Date(2026, 0, 1),
  endDate: END_OF_TODAY,
}

export const FULL_MONTH_OF_THREE_MONTHS_BEFORE_NOW = {
  startDate: new Date(2026, 2, 1),
  endDate: new Date(2026, 2, 31, 23, 59, 59, 999),
}

export const MONTH_TO_DATE_OF_ONE_MONTH_BEFORE_NOW = {
  startDate: new Date(2026, 4, 1),
  endDate: new Date(2026, 4, 15, 23, 59, 59, 999),
}
