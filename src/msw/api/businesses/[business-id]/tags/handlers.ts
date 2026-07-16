import { type RequestHandler } from 'msw'

import { post as createTagValueDefinition } from '@msw/api/businesses/[business-id]/tags/dimensions/[dimension-id]/values/post'
import { get as getTagDimensions } from '@msw/api/businesses/[business-id]/tags/dimensions/get'
import { get as getTagDimensionByKey } from '@msw/api/businesses/[business-id]/tags/dimensions/key/[dimension-key]/get'
import { post as createTagDimension } from '@msw/api/businesses/[business-id]/tags/dimensions/post'

export const tagsHandlers: RequestHandler[] = [
  getTagDimensions.handler,
  createTagDimension.handler,
  getTagDimensionByKey.handler,
  createTagValueDefinition.handler,
]
