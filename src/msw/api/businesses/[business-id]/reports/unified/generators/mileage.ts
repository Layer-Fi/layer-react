import { getLocalTimeZone } from '@internationalized/date'
import { BigDecimal } from 'effect'

import { type UnifiedReport } from '@schemas/reports/unifiedReport'
import { type Trip, TripPurpose } from '@schemas/trip'

import { tripStore } from '@msw/api/businesses/[business-id]/mileage/trips/store'
import {
  flatGroupedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/flatGrouped'
import { reportRangeFromParams } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  type ColumnHeaderKey,
  dateCell,
  decimalCell,
  emptyCell,
  textCellOrEmpty,
  totalRowLabel,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const COLUMNS: ColumnHeaderKey[] = ['date', 'customer', 'description', 'distance']

// Range bounds arrive as local dates, so the calendar date resolves in the same zone.
const tripDate = (trip: Trip) => trip.tripDate.toDate(getLocalTimeZone())

const totalDistance = (trips: readonly Trip[]) =>
  trips.reduce((total, trip) => total + BigDecimal.unsafeToNumber(trip.distance), 0)

const generateMileage = (
  params: URLSearchParams,
  purpose: TripPurpose,
  total: { rowKey: string, label: string },
): UnifiedReport => {
  const { startDate, endDate } = reportRangeFromParams(params)

  const trips = tripStore.all()
    .filter(trip => trip.deletedAt == null && trip.purpose === purpose)
    .filter(trip => tripDate(trip) >= startDate && tripDate(trip) <= endDate)
    .sort((a, b) => tripDate(a).getTime() - tripDate(b).getTime() || a.id.localeCompare(b.id))

  return flatGroupedReport({
    columns: COLUMNS,
    measureColumn: 'distance',
    items: trips,
    rowFor: trip => ({
      rowKey: trip.id,
      // Mock trips carry no customer, which the backend renders as an empty cell.
      cells: {
        date: dateCell(tripDate(trip)),
        customer: emptyCell(),
        description: textCellOrEmpty(trip.description),
        distance: decimalCell(BigDecimal.unsafeToNumber(trip.distance)),
      },
    }),
    subtotalCell: (groupTrips, options) => decimalCell(totalDistance(groupTrips), options),
    total,
  })
}

export const generateBusinessMileage = (params: URLSearchParams) => generateMileage(
  params,
  TripPurpose.Business,
  { rowKey: 'business_mileage', label: totalRowLabel('Business Mileage') },
)

export const generatePersonalMileage = (params: URLSearchParams) => generateMileage(
  params,
  TripPurpose.Personal,
  { rowKey: 'personal_mileage', label: totalRowLabel('Personal Mileage') },
)
