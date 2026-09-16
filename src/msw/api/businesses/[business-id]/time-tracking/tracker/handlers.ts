import { type RequestHandler } from 'msw'

import { get as getActiveTracker } from '@msw/api/businesses/[business-id]/time-tracking/tracker/active/get'
import { post as postStartTracker } from '@msw/api/businesses/[business-id]/time-tracking/tracker/start/post'
import { post as postStopTracker } from '@msw/api/businesses/[business-id]/time-tracking/tracker/stop/post'

export const trackerHandlers: RequestHandler[] = [
  getActiveTracker.handler,
  postStartTracker.handler,
  postStopTracker.handler,
]
