import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/shared/api/apiError'
import { useDeleteUnifiedAskFormDocument } from '@api/businesses/[business-id]/unified-tasks/[task-id]/upload/[document-id]/delete'
import { usePostUnifiedAskFormUpload } from '@api/businesses/[business-id]/unified-tasks/[task-id]/upload/post'
import { type UploadedFile } from '@blocks/Form/types'
import { withFieldGroup } from '@blocks/Form/useForm'
import { UnifiedAskFormStepShell } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStepShell'
import { useTaskAlreadyAnsweredError } from '@features/bookkeeping/UnifiedAskForm/useTaskAlreadyAnsweredError'
import { toUploadedFile } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'

// Mirrors the upload endpoint's limits, which the upload step doesn't send.
const MAX_FILES = 10
const MAX_FILE_SIZE_IN_BYTES = 10_000_000

export type UnifiedAskFormUploadStepValues = { files: UploadedFile[] }

type UnifiedAskFormUploadStepProps = {
  taskId: string
  prompt: string | null
  accept: ReadonlyArray<string>
  multiple: boolean
  isDisabled?: boolean
}

const DEFAULT_VALUES: UnifiedAskFormUploadStepValues = { files: [] }

const DEFAULT_PROPS: UnifiedAskFormUploadStepProps = { taskId: '', prompt: null, accept: [], multiple: false }

export const UnifiedAskFormUploadStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, taskId, prompt, accept, multiple, isDisabled }) {
    const { t } = useTranslation()
    const { trigger: uploadDocuments } = usePostUnifiedAskFormUpload()
    const { trigger: deleteDocument } = useDeleteUnifiedAskFormDocument()
    const { handleTaskAlreadyAnsweredError } = useTaskAlreadyAnsweredError()

    const upload = useCallback(async (files: ReadonlyArray<File>) => {
      try {
        const result = await uploadDocuments({ taskId, files })
        return result ? result.documents.map(toUploadedFile) : null
      }
      catch (error) {
        if (!handleTaskAlreadyAnsweredError(error)) throw error
        // An empty list keeps the field quiet; null would mark the files as failed uploads.
        return []
      }
    }, [taskId, uploadDocuments, handleTaskAlreadyAnsweredError])

    const remove = useCallback(async ({ id }: UploadedFile) => {
      try {
        await deleteDocument({ taskId, documentId: id })
      }
      catch (error) {
        // A document the API no longer holds has nothing left to remove.
        if (isAPIErrorOfType(error, ApiEnumErrorType.SpecifiedIdNotFound)) return
        if (!handleTaskAlreadyAnsweredError(error)) throw error
      }
    }, [taskId, deleteDocument, handleTaskAlreadyAnsweredError])

    return (
      <UnifiedAskFormStepShell prompt={prompt}>
        <group.AppField name='files'>
          {field => (
            <field.FormFileUploadField
              label={prompt ?? t('bookkeeping:UnifiedAskForm.UnifiedAskFormUploadStep.label.files', 'Files')}
              showLabel={false}
              accept={accept}
              multiple={multiple}
              isDisabled={isDisabled}
              maxFiles={MAX_FILES}
              maxFileSizeInBytes={MAX_FILE_SIZE_IN_BYTES}
              upload={upload}
              remove={remove}
            />
          )}
        </group.AppField>
      </UnifiedAskFormStepShell>
    )
  },
})
