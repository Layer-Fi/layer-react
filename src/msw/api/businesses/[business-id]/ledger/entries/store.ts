import { createMockStore } from '@msw/utils/createMockStore'
import { ledgerEntries } from '@fixtures/generated/ledgerEntries.gen'

export const ledgerEntryStore = createMockStore(() => ledgerEntries)
