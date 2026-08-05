import { trips } from '@fixtures/generated/trips.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const tripStore = createMockStore(() => trips)
