import { type RequestHandler } from 'msw'

import { del as deleteTimeEntry } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/[time-entry-id]/delete'
import { get as getTimeEntries } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/get'
import { patch as patchTimeEntry } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/patch'
import { post as postTimeEntry } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/post'
import { get as getTimeEntriesSummary } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/summary/get'

export const timeEntriesHandlers: RequestHandler[] = [
  getTimeEntriesSummary.handler,
  getTimeEntries.handler,
  postTimeEntry.handler,
  patchTimeEntry.handler,
  deleteTimeEntry.handler,
]
