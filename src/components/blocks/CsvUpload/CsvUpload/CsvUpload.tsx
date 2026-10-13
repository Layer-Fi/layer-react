import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { DropZone } from '@ui/DropZone/DropZone'
import { type DropZonePromptProps } from '@ui/DropZone/DropZonePrompt'
import { type DropZoneRejection } from '@ui/DropZone/dropZoneValidation'
import { FileRow } from '@ui/FileRow/FileRow'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { validateCsvFile } from '@blocks/CsvUpload/CsvUpload/validateCsvFile'

type CsvUploadProps = {
  file: File | null
  onFileSelected: (file: File | null) => void
}

export const CsvUpload = ({ file, onFileSelected }: CsvUploadProps) => {
  const { t } = useTranslation()
  const { formatFileSize } = useIntlFormatter()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const getRejectionMessage = ({ reason, message }: DropZoneRejection) => {
    if (reason === 'invalid') return message
    if (reason === 'count') return t('upload:validation.too_many_files_selected', 'Too many files selected')
    return t('upload:error.unknown_upload_error', 'Unknown upload error')
  }

  // A rejected drop reports the problem and leaves any already-chosen file in place.
  const onDrop = ([accepted]: ReadonlyArray<File>, [rejection]: ReadonlyArray<DropZoneRejection>) => {
    setErrorMessage(rejection ? getRejectionMessage(rejection) : undefined)
    if (!rejection && accepted) onFileSelected(accepted)
  }

  const clearFile = () => {
    setErrorMessage(undefined)
    onFileSelected(null)
  }

  const prompt: DropZonePromptProps = {
    title: t('upload:label.drag_drop_file', 'Drag and drop a file'),
    description: t('upload:validation.file_must_be_csv', 'File must be in CSV format'),
    actionLabel: t('upload:action.browse', 'Browse'),
  }

  return (
    <VStack gap='xs'>
      <DropZone
        accept={['csv']}
        size='lg'
        isInvalid={errorMessage !== undefined}
        validate={csvFile => validateCsvFile({ file: csvFile, t, formatFileSize })}
        onDrop={onDrop}
        prompt={file ? undefined : prompt}
      >
        {file ? ({ open }) => <FileRow name={file.name} sizeInBytes={file.size} onReplace={open} onRemove={clearFile} /> : undefined}
      </DropZone>
      {errorMessage && <Span size='sm' status='error'>{errorMessage}</Span>}
    </VStack>
  )
}
