import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { AskFormUploadResultSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormUpload'
import { postWithFormData } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UNIFIED_ASK_FORM_UPLOAD_TAG_KEY = '#unified-ask-form-upload'

const PostUnifiedAskFormUploadReturnSchema = UnwrappedDataResponseSchema(AskFormUploadResultSchema)

type UploadToUnifiedTaskParams = {
  businessId: string
  taskId: string
}

type UploadToUnifiedTaskBody = {
  files: ReadonlyArray<File>
}

function uploadToUnifiedTask(
  baseUrl: string,
  accessToken: string | undefined,
  options?: {
    params?: UploadToUnifiedTaskParams
    body?: UploadToUnifiedTaskBody
  },
) {
  const { businessId, taskId } = options?.params ?? ({} as UploadToUnifiedTaskParams)
  const { files } = options?.body ?? ({} as UploadToUnifiedTaskBody)

  const formData = new FormData()
  files.forEach(file => formData.append('file', file))

  return postWithFormData<typeof PostUnifiedAskFormUploadReturnSchema.Encoded>(
    `/v1/businesses/${businessId}/unified-tasks/${taskId}/upload`,
    formData,
    baseUrl,
    accessToken,
  )
}

type UsePostUnifiedAskFormUploadArg = {
  taskId: string
  files: ReadonlyArray<File>
}

export const usePostUnifiedAskFormUpload = createMutationHook({
  tags: [UNIFIED_ASK_FORM_UPLOAD_TAG_KEY],
  request: uploadToUnifiedTask,
  schema: PostUnifiedAskFormUploadReturnSchema,
  argToParams: ({ taskId }: UsePostUnifiedAskFormUploadArg) => ({ taskId }),
  argToBody: ({ files }: UsePostUnifiedAskFormUploadArg) => ({ files }),
  swrOptions: { throwOnError: false },
})
