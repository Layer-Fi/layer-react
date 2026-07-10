import { createMockStore } from '@msw/utils/createMockStore'
import { customAccounts } from '@fixtures/generated/customAccounts.gen'

export const customAccountStore = createMockStore(() => customAccounts)
