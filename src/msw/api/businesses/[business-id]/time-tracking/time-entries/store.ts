import { createMockStore } from '@msw/utils/createMockStore'
import { timeEntries } from '@fixtures/generated/timeEntries.gen'

export const timeEntryStore = createMockStore(() => timeEntries)
