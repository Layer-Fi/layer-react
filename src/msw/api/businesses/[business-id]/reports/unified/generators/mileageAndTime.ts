import { eachMonthOfInterval, format } from 'date-fns'

import { Pinning, type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import { currentYearFallback } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  currencyCell,
  decimalCell,
  durationCell,
  MOCK_REPORT_BUSINESS_ID,
  numericColumn,
  parseDateRangeParams,
  type ReportDateRange,
  rowHeaderColumn,
  textCell,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { hashString } from '@fixtures/unifiedReports/deterministicAmounts'

const MILEAGE_RATE_CENTS = 67

const monthsInRange = (range: ReportDateRange) =>
  range.startDate > range.endDate ? [] : eachMonthOfInterval({ start: range.startDate, end: range.endDate })

const generateMileage = (params: URLSearchParams, keyPrefix: string, tripsBase: number): UnifiedReport => {
  const range = parseDateRangeParams(params, currentYearFallback())
  const months = monthsInRange(range)

  let totalTrips = 0
  let totalMiles = 0
  let totalDeduction = 0

  const rows: UnifiedReportRow[] = months.map((month) => {
    const seed = hashString(`${keyPrefix}:${format(month, 'yyyy-MM')}`)
    const trips = tripsBase + (seed % 10)
    const miles = Math.round((trips * (12 + (seed % 25))) * 10) / 10
    const deduction = Math.round(miles * MILEAGE_RATE_CENTS)
    totalTrips += trips
    totalMiles += miles
    totalDeduction += deduction

    return {
      rowKey: format(month, 'yyyy-MM'),
      cells: {
        month: textCell(format(month, 'MMM yyyy')),
        trips: decimalCell(trips),
        miles: decimalCell(miles),
        deduction: currencyCell(deduction),
      },
    }
  })

  rows.push({
    rowKey: 'total_mileage',
    cells: {
      month: textCell('Total', { bold: true }),
      trips: decimalCell(totalTrips, { bold: true }),
      miles: decimalCell(Math.round(totalMiles * 10) / 10, { bold: true }),
      deduction: currencyCell(totalDeduction, { bold: true }),
    },
  })

  return {
    businessId: MOCK_REPORT_BUSINESS_ID,
    columns: [
      rowHeaderColumn('month', 'Month'),
      numericColumn('trips', 'Trips'),
      numericColumn('miles', 'Miles'),
      numericColumn('deduction', 'Deduction', Pinning.Right),
    ],
    rows,
  }
}

export const generateBusinessMileage = (params: URLSearchParams) =>
  generateMileage(params, 'business_mileage', 8)

export const generatePersonalMileage = (params: URLSearchParams) =>
  generateMileage(params, 'personal_mileage', 3)

const TIME_TRACKING_CUSTOMERS = ['Soylent Corp', 'Initech', 'Oscorp Industries', 'Wayne Enterprises', 'Internal']
const BILLABLE_RATE_CENTS_PER_HOUR = 12_500

export const generateTimeTracking = (params: URLSearchParams): UnifiedReport => {
  const range = parseDateRangeParams(params, currentYearFallback())
  const monthCount = Math.max(1, monthsInRange(range).length)

  let totalEntries = 0
  let totalMinutes = 0
  let totalBillable = 0

  const rows: UnifiedReportRow[] = TIME_TRACKING_CUSTOMERS.map((customer) => {
    const seed = hashString(`time_tracking:${customer}`)
    const entries = (4 + (seed % 6)) * monthCount
    const minutes = (90 + (seed % 240)) * entries
    const billable = Math.round((minutes / 60) * BILLABLE_RATE_CENTS_PER_HOUR)
    totalEntries += entries
    totalMinutes += minutes
    totalBillable += billable

    return {
      rowKey: customer,
      cells: {
        customer: textCell(customer),
        entries: decimalCell(entries),
        duration: durationCell(minutes),
        billable_amount: currencyCell(billable),
      },
    }
  })

  rows.push({
    rowKey: 'total_time_tracking',
    cells: {
      customer: textCell('Total', { bold: true }),
      entries: decimalCell(totalEntries, { bold: true }),
      duration: durationCell(totalMinutes, { bold: true }),
      billable_amount: currencyCell(totalBillable, { bold: true }),
    },
  })

  return {
    businessId: MOCK_REPORT_BUSINESS_ID,
    columns: [
      rowHeaderColumn('customer', 'Customer'),
      numericColumn('entries', 'Entries'),
      numericColumn('duration', 'Duration'),
      numericColumn('billable_amount', 'Billable', Pinning.Right),
    ],
    rows,
  }
}
