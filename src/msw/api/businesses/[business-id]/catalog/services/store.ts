import { catalogServices } from '@fixtures/generated/catalogServices.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const catalogServiceStore = createMockStore(() => catalogServices)
