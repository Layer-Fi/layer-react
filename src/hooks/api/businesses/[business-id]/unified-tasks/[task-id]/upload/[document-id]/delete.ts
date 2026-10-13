import { del } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UNIFIED_ASK_FORM_DOCUMENT_DELETE_TAG_KEY = '#unified-ask-form-document:delete'

type DeleteUnifiedAskFormDocumentParams = {
  businessId: string
  taskId: string
  documentId: string
}

const deleteUnifiedAskFormDocument = del<never, Record<string, unknown>, DeleteUnifiedAskFormDocumentParams>(
  ({ businessId, taskId, documentId }) => `/v1/businesses/${businessId}/unified-tasks/${taskId}/upload/${documentId}`,
)

type UseDeleteUnifiedAskFormDocumentArg = {
  taskId: string
  documentId: string
}

export const useDeleteUnifiedAskFormDocument = createMutationHook({
  tags: [UNIFIED_ASK_FORM_DOCUMENT_DELETE_TAG_KEY],
  request: deleteUnifiedAskFormDocument,
  argToParams: ({ taskId, documentId }: UseDeleteUnifiedAskFormDocumentArg) => ({ taskId, documentId }),
  argToBody: () => undefined,
  swrOptions: { throwOnError: true },
})
