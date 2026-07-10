import { createMockStore } from '@msw/utils/createMockStore'
import { catalogServices } from '@fixtures/generated/catalogServices.gen'

export const catalogServiceStore = createMockStore(() => catalogServices)
