import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type AskFormAnswer } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { usePostTaskUpload } from '@api/businesses/[business-id]/tasks/[task-id]/upload/post'
import { Button } from '@ui/Button/Button'
import { FileInput } from '@ui/Input/FileInput'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

type UnifiedAskFormUploadProps = {
  taskId: string
  accept: ReadonlyArray<string>
  multiple: boolean
  answer: AskFormAnswer | undefined
  onChange: (answer: AskFormAnswer) => void
}

type UploadedFile = { id: string, name: string }

const getExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() ?? ''

export const UnifiedAskFormUpload = ({ taskId, accept, multiple, answer, onChange }: UnifiedAskFormUploadProps) => {
  const { t } = useTranslation()
  const { trigger: uploadDocument, isMutating } = usePostTaskUpload()
  const [uploadedFiles, setUploadedFiles] = useState<ReadonlyArray<UploadedFile>>([])
  const [error, setError] = useState<string | null>(null)

  const documentIds = answer && 'documentIds' in answer ? answer.documentIds : []
  const acceptedExtensions = accept.map(extension => extension.toLowerCase())

  const onUpload = async (files: ReadonlyArray<File>) => {
    const rejected = files.filter(({ name }) => !acceptedExtensions.includes(getExtension(name)))
    const toUpload = files.filter(file => !rejected.includes(file))

    const results = await Promise.all(toUpload.map(async (file) => {
      const response = await uploadDocument({ taskId, files: [file] })
      const id = response?.data.id

      return id ? { id, name: file.name } : null
    }))

    const uploaded = results.filter(result => result !== null)
    const failedCount = rejected.length + toUpload.length - uploaded.length

    setError(failedCount > 0
      ? t(
        'bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.error.files_not_added',
        'Some files couldn’t be added. Upload a {{fileTypes}} file instead.',
        { fileTypes: acceptedExtensions.map(extension => extension.toUpperCase()).join(', ') },
      )
      : null)

    if (uploaded.length === 0) return

    setUploadedFiles(current => [...current, ...uploaded])
    onChange({ documentIds: [...(multiple ? documentIds : []), ...uploaded.map(({ id }) => id)] })
  }

  const onRemove = (id: string) => {
    onChange({ documentIds: documentIds.filter(other => other !== id) })
  }

  return (
    <VStack gap='xs'>
      {documentIds.map(id => (
        <HStack key={id} gap='sm' align='center' justify='space-between' className='Layer__UnifiedAskForm__File'>
          <Span size='sm' ellipsis noWrap>{uploadedFiles.find(file => file.id === id)?.name ?? id}</Span>
          <Button variant='text' onPress={() => onRemove(id)}>
            {t('bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.action.remove_file', 'Remove')}
          </Button>
        </HStack>
      ))}
      {error ? <Span size='xs' status='error'>{error}</Span> : null}
      <HStack>
        <FileInput
          text={documentIds.length > 0
            ? t('bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.action.add_more_files', 'Add more files')
            : t('bookkeeping:UnifiedAskForm.UnifiedAskFormUpload.action.upload_files', 'Upload files')}
          accept={acceptedExtensions.map(extension => `.${extension}`).join(',')}
          allowMultipleUploads={multiple}
          isDisabled={isMutating}
          onUpload={files => void onUpload(files)}
        />
      </HStack>
    </VStack>
  )
}
