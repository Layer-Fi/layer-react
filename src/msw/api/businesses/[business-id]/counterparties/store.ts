import { counterparties } from '@fixtures/generated/counterparties.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const counterpartyStore = createMockStore(() => counterparties)
