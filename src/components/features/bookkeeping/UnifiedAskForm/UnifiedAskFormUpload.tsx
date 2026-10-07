import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type AskFormAnswer } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { usePostUnifiedAskFormUpload } from '@api/businesses/[business-id]/unified-tasks/[task-id]/upload/post'
import { Button } from '@ui/Button/Button'
import { FileInput } from '@ui/Input/FileInput'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { type AskFormLabels } from '@features/bookkeeping/UnifiedAskForm/unifiedAskFormUtils'

type UnifiedAskFormUploadProps = {
  taskId: string
  accept: ReadonlyArray<string>
  multiple: boolean
  answer: AskFormAnswer | undefined
  labels: AskFormLabels
  onChange: (answer: AskFormAnswer) => void
  onLabel: (id: string, label: string) => void
}

const getExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() ?? ''

export const UnifiedAskFormUpload = ({ taskId, accept, multiple, answer, labels, onChange, onLabel }: UnifiedAskFormUploadProps) => {
  const { t } = useTranslation()
  const { formatList } = useIntlFormatter()
  const { trigger: uploadDocuments, isMutating } = usePostUnifiedAskFormUpload()
  const [error, setError] = useState<string | null>(null)

  const documentIds = answer && 'documentIds' in answer ? answer.documentIds : []
  const acceptedExtensions = accept.map(extension => extension.toLowerCase())
  const isAccepted = (name: string) => acceptedExtensions.length === 0 || acceptedExtensions.includes(getExtension(name))

  const onUpload = async (files: ReadonlyArray<File>) => {
    const rejected = files.filter(({ name }) => !isAccepted(name))
    const toUpload = files.filter(file => !rejected.includes(file))

    const result = toUpload.length > 0 ? await uploadDocuments({ taskId, files: toUpload }).catch(() => undefined) : undefined
    const uploaded = result?.documents ?? []

    if (rejected.length > 0) {
      setError(t(
        'bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.error.files_not_added',
        'Some files couldn’t be added. Upload a {{fileTypes}} file instead.',
        { fileTypes: formatList(acceptedExtensions.map(extension => extension.toUpperCase()), { type: 'disjunction' }) },
      ))
    }
    else if (toUpload.length > 0 && uploaded.length === 0) {
      setError(t('bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.error.upload_failed', 'Some files couldn’t be uploaded. Try again.'))
    }
    else {
      setError(null)
    }

    if (uploaded.length === 0) return

    uploaded.forEach(({ id, fileName }) => onLabel(id, fileName))
    onChange({ documentIds: [...(multiple ? documentIds : []), ...uploaded.map(({ id }) => id)] })
  }

  const getUploadLabel = () => {
    if (documentIds.length === 0) return t('bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.action.upload_files', 'Upload files')
    if (multiple) return t('bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.action.add_more_files', 'Add more files')
    return t('bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.action.replace_file', 'Replace file')
  }

  const onRemove = (id: string) => {
    onChange({ documentIds: documentIds.filter(other => other !== id) })
  }

  return (
    <VStack gap='xs'>
      {documentIds.map(id => (
        <HStack key={id} gap='sm' align='center' justify='space-between' className='Layer__UnifiedAskForm__File'>
          <Span size='sm' ellipsis noWrap>{labels[id] ?? id}</Span>
          <Button variant='text' isDisabled={isMutating} onPress={() => onRemove(id)}>
            {t('bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.action.remove_file', 'Remove')}
          </Button>
        </HStack>
      ))}
      {error ? <Span size='xs' status='error'>{error}</Span> : null}
      <HStack>
        <FileInput
          text={getUploadLabel()}
          accept={acceptedExtensions.map(extension => `.${extension}`).join(',')}
          allowMultipleUploads={multiple}
          isDisabled={isMutating}
          onUpload={files => void onUpload(files)}
        />
      </HStack>
    </VStack>
  )
}
