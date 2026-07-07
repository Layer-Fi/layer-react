import { BigDecimal } from 'effect'

import { type MileageMonth, type MileageSummary, type MileageYear } from '@schemas/mileage'
import { TripPurpose } from '@schemas/trip'

import { trips } from '@fixtures/generated/trips.gen'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const DEDUCTION_RATE = 0.67

type Bucket = { trips: number, miles: number }
type Buckets = { business: Bucket, personal: Bucket, uncategorized: Bucket }

const emptyBuckets = (): Buckets => ({
  business: { trips: 0, miles: 0 },
  personal: { trips: 0, miles: 0 },
  uncategorized: { trips: 0, miles: 0 },
})

const bucketNameFor = (purpose: TripPurpose): keyof Buckets => {
  if (purpose === TripPurpose.Business) return 'business'
  if (purpose === TripPurpose.Personal) return 'personal'
  return 'uncategorized'
}

const round1 = (n: number) => Math.round(n * 10) / 10

const yearsByYear = new Map<number, Map<number, Buckets>>()

for (const trip of trips) {
  const year = trip.tripDate.year
  const month = trip.tripDate.month
  const bucketName = bucketNameFor(trip.purpose)
  const miles = BigDecimal.unsafeToNumber(trip.distance)

  const monthsForYear = yearsByYear.get(year) ?? new Map<number, Buckets>()
  yearsByYear.set(year, monthsForYear)

  const buckets = monthsForYear.get(month) ?? emptyBuckets()
  monthsForYear.set(month, buckets)

  const bucket = buckets[bucketName]
  buckets[bucketName] = { trips: bucket.trips + 1, miles: bucket.miles + miles }
}

const sumMonths = (months: readonly MileageMonth[], field: keyof MileageMonth) =>
  months.reduce((total, month) => total + (month[field] as number), 0)

const years: MileageYear[] = Array.from(yearsByYear.entries())
  .sort(([a], [b]) => a - b)
  .map(([year, monthsForYear]) => {
    const months: MileageMonth[] = Array.from(monthsForYear.entries())
      .sort(([a], [b]) => a - b)
      .map(([month, buckets]) => {
        const businessMiles = round1(buckets.business.miles)
        const personalMiles = round1(buckets.personal.miles)
        const uncategorizedMiles = round1(buckets.uncategorized.miles)

        return {
          month,
          miles: round1(businessMiles + personalMiles + uncategorizedMiles),
          businessMiles,
          personalMiles,
          uncategorizedMiles,
          estimatedDeduction: Math.round(businessMiles * DEDUCTION_RATE * 100) / 100,
          trips: buckets.business.trips + buckets.personal.trips + buckets.uncategorized.trips,
          businessTrips: buckets.business.trips,
          personalTrips: buckets.personal.trips,
          uncategorizedTrips: buckets.uncategorized.trips,
          deductionRate: DEDUCTION_RATE,
        }
      })

    return {
      year,
      miles: round1(sumMonths(months, 'miles')),
      businessMiles: round1(sumMonths(months, 'businessMiles')),
      personalMiles: round1(sumMonths(months, 'personalMiles')),
      uncategorizedMiles: round1(sumMonths(months, 'uncategorizedMiles')),
      estimatedDeduction: Math.round(sumMonths(months, 'estimatedDeduction') * 100) / 100,
      trips: sumMonths(months, 'trips'),
      businessTrips: sumMonths(months, 'businessTrips'),
      personalTrips: sumMonths(months, 'personalTrips'),
      uncategorizedTrips: sumMonths(months, 'uncategorizedTrips'),
      months,
    }
  })

const baseMileageSummary: MileageSummary = { years }

export const { make: makeMileageSummary, makeMany: makeMileageSummaries } =
  createFixtureFactory(baseMileageSummary)
