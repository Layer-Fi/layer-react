import { type RequestHandler } from 'msw'

import { post as postAskFormNextPage } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/next-page/post'
import { post as postUnifiedAskFormResponse } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/response/post'
import { del as deleteUnifiedAskFormDocument } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/upload/[document-id]/delete'
import { post as postUnifiedAskFormUpload } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/upload/post'

export const unifiedTasksHandlers: RequestHandler[] = [
  postUnifiedAskFormResponse.handler,
  postAskFormNextPage.handler,
  postUnifiedAskFormUpload.handler,
  deleteUnifiedAskFormDocument.handler,
]
