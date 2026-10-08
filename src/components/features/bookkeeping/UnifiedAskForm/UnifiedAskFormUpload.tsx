import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { usePostUnifiedAskFormUpload } from '@api/businesses/[business-id]/unified-tasks/[task-id]/upload/post'
import { UploadStep } from '@blocks/FormSteps/UploadStep'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type AskFormStepPath } from '@features/bookkeeping/UnifiedAskForm/utils/formValues'

// The API stores at most this many files per upload request.
const MAX_FILES_PER_UPLOAD = 10

type UnifiedAskFormUploadProps = {
  form: UnifiedAskFormApi
  fields: AskFormStepPath
  taskId: string
  prompt: string | null
  accept: ReadonlyArray<string>
  multiple: boolean
}

export const UnifiedAskFormUpload = ({ form, fields, taskId, prompt, accept, multiple }: UnifiedAskFormUploadProps) => {
  const { t } = useTranslation()
  const { trigger: uploadDocuments } = usePostUnifiedAskFormUpload()

  const upload = useCallback(async (files: ReadonlyArray<File>) => {
    const result = await uploadDocuments({ taskId, files })
    return result ? result.documents.map(({ id, fileName }) => ({ id, name: fileName })) : null
  }, [taskId, uploadDocuments])

  return (
    <UploadStep
      form={form}
      fields={fields}
      label={t('bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.label.files', 'Files')}
      prompt={prompt}
      accept={accept}
      multiple={multiple}
      maxFiles={MAX_FILES_PER_UPLOAD}
      upload={upload}
    />
  )
}
