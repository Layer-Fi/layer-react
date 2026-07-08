import { type RequestHandler } from 'msw'

import { catalogServiceHandlers } from '@msw/api/businesses/[business-id]/catalog/services/[service-id]/handlers'
import { get as getCatalogServices } from '@msw/api/businesses/[business-id]/catalog/services/get'
import { post as postCatalogService } from '@msw/api/businesses/[business-id]/catalog/services/post'

export const catalogHandlers: RequestHandler[] = [
  getCatalogServices.handler,
  postCatalogService.handler,
  ...catalogServiceHandlers,
]
