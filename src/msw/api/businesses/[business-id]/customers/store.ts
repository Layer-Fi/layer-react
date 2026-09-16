import { customers } from '@fixtures/generated/customers.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const customerStore = createMockStore(() => customers)
