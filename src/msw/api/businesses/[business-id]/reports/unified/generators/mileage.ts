import { format } from 'date-fns'

import { Pinning, type UnifiedReport } from '@schemas/reports/unifiedReport'

import { monthsInRange, reportRangeFromParams } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import { generateTableReport } from '@msw/api/businesses/[business-id]/reports/unified/generators/tableReport'
import { hashString } from '@fixtures/unifiedReports/deterministicAmounts'

const MILEAGE_RATE_CENTS = 67

const roundToTenth = (value: number) => Math.round(value * 10) / 10

const generateMileage = (params: URLSearchParams, keyPrefix: string, tripsBase: number): UnifiedReport => {
  const months = monthsInRange(reportRangeFromParams(params)).map((month) => {
    const seed = hashString(`${keyPrefix}:${format(month, 'yyyy-MM')}`)
    const trips = tripsBase + (seed % 10)
    const miles = roundToTenth(trips * (12 + (seed % 25)))

    return { month, trips, miles, deduction: Math.round(miles * MILEAGE_RATE_CENTS) }
  })

  return generateTableReport({
    rowHeader: { columnKey: 'month', displayName: 'Month', label: ({ month }) => format(month, 'MMM yyyy') },
    rowKey: ({ month }) => format(month, 'yyyy-MM'),
    items: months,
    valueColumns: [
      { columnKey: 'trips', displayName: 'Trips', cellType: 'decimal', value: ({ trips }) => trips },
      { columnKey: 'miles', displayName: 'Miles', cellType: 'decimal', value: ({ miles }) => miles, formatTotal: roundToTenth },
      { columnKey: 'deduction', displayName: 'Deduction', value: ({ deduction }) => deduction, pinning: Pinning.Right },
    ],
    total: { rowKey: 'total_mileage', label: 'Total' },
  })
}

export const generateBusinessMileage = (params: URLSearchParams) =>
  generateMileage(params, 'business_mileage', 8)

export const generatePersonalMileage = (params: URLSearchParams) =>
  generateMileage(params, 'personal_mileage', 3)
