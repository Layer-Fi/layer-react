import { type TimeEntry } from '@schemas/timeTracking'

import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'

export const findActiveTimeEntry = (): TimeEntry | undefined =>
  timeEntryStore.all().find(entry => entry.status === 'ACTIVE' && entry.deletedAt == null)
