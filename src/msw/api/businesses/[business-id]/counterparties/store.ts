import { createMockStore } from '@msw/utils/createMockStore'
import { counterparties } from '@fixtures/generated/counterparties.gen'

export const counterpartyStore = createMockStore(() => counterparties)
