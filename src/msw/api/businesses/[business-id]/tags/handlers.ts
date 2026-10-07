import { type RequestHandler } from 'msw'

import { get as getTagDimensions } from '@msw/api/businesses/[business-id]/tags/dimensions/get'
import { get as getTagDimensionByKey } from '@msw/api/businesses/[business-id]/tags/dimensions/key/[dimension-key]/get'

export const tagsHandlers: RequestHandler[] = [
  getTagDimensions.handler,
  getTagDimensionByKey.handler,
]
