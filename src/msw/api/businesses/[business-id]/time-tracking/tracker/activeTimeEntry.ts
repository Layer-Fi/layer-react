import { type TimeEntry } from '@schemas/timeTracking'

import { isActiveTimeEntry, timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'

export const findActiveTimeEntry = (): TimeEntry | undefined =>
  timeEntryStore.all().find(entry => isActiveTimeEntry(entry) && entry.deletedAt == null)
