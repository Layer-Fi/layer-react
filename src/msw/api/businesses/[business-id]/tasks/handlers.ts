import { type RequestHandler } from 'msw'

import { post as postTaskUserResponse } from '@msw/api/businesses/[business-id]/tasks/[task-id]/user-response/post'

export const tasksHandlers: RequestHandler[] = [
  postTaskUserResponse.handler,
]
