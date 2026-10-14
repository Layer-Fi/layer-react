import { findUnifiedTaskDocuments, saveUnifiedTaskDocuments } from '@msw/api/businesses/[business-id]/unified-tasks/[task-id]/upload/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/unified-tasks/:taskId/upload/:documentId',
  resolve: ({ params }) => {
    const taskId = String(params.taskId)
    const documentId = String(params.documentId)

    saveUnifiedTaskDocuments(taskId, findUnifiedTaskDocuments(taskId).filter(({ id }) => id !== documentId))

    return {}
  },
})
