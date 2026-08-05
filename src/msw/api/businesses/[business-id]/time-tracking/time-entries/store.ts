import { type TimeEntry } from '@schemas/features/timeTracking/timeEntry'

import { timeEntries } from '@fixtures/generated/timeEntries.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const timeEntryStore = createMockStore(() => timeEntries)

export const isActiveTimeEntry = (entry: TimeEntry) => entry.status === 'ACTIVE'
