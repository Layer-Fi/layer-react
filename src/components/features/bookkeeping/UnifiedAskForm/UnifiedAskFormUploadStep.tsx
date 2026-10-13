import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { usePostUnifiedAskFormUpload } from '@api/businesses/[business-id]/unified-tasks/[task-id]/upload/post'
import { type UploadedFile } from '@blocks/Form/FormFileUploadField'
import { withFieldGroup } from '@blocks/Form/useForm'
import { UnifiedAskFormStepShell } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStepShell'

// The upload step carries no limits, so these mirror what the upload endpoint enforces: at most
// 10 files per request and the default ~10 MB multipart file cap.
const MAX_FILES = 10
const MAX_FILE_SIZE_IN_BYTES = 10_000_000

export type UnifiedAskFormUploadStepValues = { files: UploadedFile[] }

type UnifiedAskFormUploadStepProps = {
  taskId: string
  prompt: string | null
  accept: ReadonlyArray<string>
  multiple: boolean
}

const DEFAULT_VALUES: UnifiedAskFormUploadStepValues = { files: [] }

const DEFAULT_PROPS: UnifiedAskFormUploadStepProps = { taskId: '', prompt: null, accept: [], multiple: false }

export const UnifiedAskFormUploadStep = withFieldGroup({
  defaultValues: DEFAULT_VALUES,
  props: DEFAULT_PROPS,
  render: function Render({ group, taskId, prompt, accept, multiple }) {
    const { t } = useTranslation()
    const { trigger: uploadDocuments } = usePostUnifiedAskFormUpload()

    const upload = useCallback(async (files: ReadonlyArray<File>) => {
      const result = await uploadDocuments({ taskId, files })
      return result ? result.documents.map(({ id, fileName }) => ({ id, name: fileName })) : null
    }, [taskId, uploadDocuments])

    return (
      <UnifiedAskFormStepShell prompt={prompt}>
        <group.AppField name='files'>
          {field => (
            <field.FormFileUploadField
              label={prompt ?? t('bookkeeping:UnifiedAskForm.UnifiedAskFormUploadStep.label.files', 'Files')}
              showLabel={false}
              accept={accept}
              multiple={multiple}
              maxFiles={MAX_FILES}
              maxFileSizeInBytes={MAX_FILE_SIZE_IN_BYTES}
              upload={upload}
            />
          )}
        </group.AppField>
      </UnifiedAskFormStepShell>
    )
  },
})
