import { type RequestHandler } from 'msw'

import { post as postArchiveCatalogService } from '@msw/api/businesses/[business-id]/catalog/services/[service-id]/archive/post'
import { patch as patchCatalogService } from '@msw/api/businesses/[business-id]/catalog/services/[service-id]/patch'
import { post as postReactivateCatalogService } from '@msw/api/businesses/[business-id]/catalog/services/[service-id]/reactivate/post'

export const catalogServiceHandlers: RequestHandler[] = [
  patchCatalogService.handler,
  postArchiveCatalogService.handler,
  postReactivateCatalogService.handler,
]
