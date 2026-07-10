import { createMockStore } from '@msw/utils/createMockStore'
import { customers } from '@fixtures/generated/customers.gen'

export const customerStore = createMockStore(() => customers)
