import { createMockStore } from '@msw/utils/createMockStore'
import { trips } from '@fixtures/generated/trips.gen'

export const tripStore = createMockStore(() => trips)
