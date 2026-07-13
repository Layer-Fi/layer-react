import { type DateRange } from '@utils/date/dateRange'

export const FIXTURE_YEAR = 2025

export const FIXTURE_YEAR_RANGE: DateRange = {
  startDate: new Date(FIXTURE_YEAR, 0, 1),
  endDate: new Date(FIXTURE_YEAR, 11, 31),
}
