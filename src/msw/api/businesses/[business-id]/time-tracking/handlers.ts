import { type RequestHandler } from 'msw'

import { timeEntriesHandlers } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/handlers'
import { trackerHandlers } from '@msw/api/businesses/[business-id]/time-tracking/tracker/handlers'

export const timeTrackingHandlers: RequestHandler[] = [
  ...timeEntriesHandlers,
  ...trackerHandlers,
]
