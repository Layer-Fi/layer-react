import { type RequestHandler } from 'msw'

import { post as postAskFormNextPage } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { post as postUnifiedAskFormResponse } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/response/post'

export const unifiedTasksHandlers: RequestHandler[] = [
  postUnifiedAskFormResponse.handler,
  postAskFormNextPage.handler,
]
