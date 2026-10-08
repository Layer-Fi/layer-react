import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { usePostUnifiedAskFormUpload } from '@api/businesses/[business-id]/unified-tasks/[task-id]/upload/post'
import { type UploadedFile } from '@blocks/Form/FormFileUploadField'
import { withFieldGroup } from '@blocks/Form/useForm'
import { UnifiedAskFormStepShell } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormStepShell'

// The API stores at most this many files per upload request.
const MAX_FILES_PER_UPLOAD = 10

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
              maxFiles={MAX_FILES_PER_UPLOAD}
              upload={upload}
            />
          )}
        </group.AppField>
      </UnifiedAskFormStepShell>
    )
  },
})
