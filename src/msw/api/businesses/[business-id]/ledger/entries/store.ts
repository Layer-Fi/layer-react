import { ledgerEntries } from '@fixtures/generated/ledgerEntries.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const ledgerEntryStore = createMockStore(() => ledgerEntries)
