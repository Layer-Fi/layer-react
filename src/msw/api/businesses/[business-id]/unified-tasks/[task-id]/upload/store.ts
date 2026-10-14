import { type AskFormDocument } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormUpload'

import { createMockStore } from '@msw/utils/createMockStore'

const unifiedTaskDocumentStore = createMockStore<{ id: string, documents: ReadonlyArray<AskFormDocument> }>(() => [])

export const findUnifiedTaskDocuments = (taskId: string) => unifiedTaskDocumentStore.findById(taskId)?.documents ?? []

export const saveUnifiedTaskDocuments = (taskId: string, documents: ReadonlyArray<AskFormDocument>) =>
  unifiedTaskDocumentStore.save({ id: taskId, documents })
