import { type CallBooking } from '@schemas/callBooking'

import { createMockStore } from '@msw/utils/createMockStore'

// Empty seed: the default list is empty until a story or test books a call.
export const callBookingStore = createMockStore<CallBooking>(() => [])
