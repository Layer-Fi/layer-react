import { CalendarDate } from '@internationalized/date'

import { type TimeEntry } from '@schemas/timeTracking'

import { makeBusiness } from '@fixtures/business/mocks'
import { makeCatalogService } from '@fixtures/catalogServices/mocks'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseService = makeCatalogService()

const baseTimeEntry: TimeEntry = {
  id: '00000000-0000-4000-8000-000000000701',
  businessId: makeBusiness().id,
  externalId: 'ext_70001',
  date: new CalendarDate(2025, 3, 15),
  durationMinutes: 90,
  billable: true,
  description: 'Kickoff meeting',
  memo: 'Billed at standard rate',
  metadata: null,
  customer: null,
  service: {
    id: baseService.id,
    name: baseService.name,
    billableRatePerHourAmount: baseService.billableRatePerHourAmount,
  },
  invoiceLineItem: null,
  status: 'RECORDED',
  stoppedAt: null,
  createdAt: new Date('2025-03-15T00:00:00.000Z'),
  updatedAt: new Date('2025-03-15T00:00:00.000Z'),
  deletedAt: null,
}

export const { make: makeTimeEntry, makeMany: makeTimeEntries } =
  createFixtureFactory(baseTimeEntry)
