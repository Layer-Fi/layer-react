import { customAccounts } from '@fixtures/generated/customAccounts.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const customAccountStore = createMockStore(() => customAccounts)
