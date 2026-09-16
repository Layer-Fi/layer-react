import { type RequestHandler } from 'msw'

import { post as deleteTaskUploads } from '@msw/api/businesses/[business-id]/tasks/[task-id]/upload/delete/post'
import { post as uploadDocumentsForTask } from '@msw/api/businesses/[business-id]/tasks/[task-id]/upload/post'
import { post as updateTaskUploadDescription } from '@msw/api/businesses/[business-id]/tasks/[task-id]/upload/update-description/post'
import { post as postTaskUserResponse } from '@msw/api/businesses/[business-id]/tasks/[task-id]/user-response/post'

export const tasksHandlers: RequestHandler[] = [
  postTaskUserResponse.handler,
  uploadDocumentsForTask.handler,
  deleteTaskUploads.handler,
  updateTaskUploadDescription.handler,
]
