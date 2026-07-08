import { type TimeEntry } from '@schemas/timeTracking'

import { createMockStore } from '@msw/utils/createMockStore'
import { timeEntries } from '@fixtures/generated/timeEntries.gen'

export const timeEntryStore = createMockStore(() => timeEntries)

export const isActiveTimeEntry = (entry: TimeEntry) => entry.status === 'ACTIVE'
