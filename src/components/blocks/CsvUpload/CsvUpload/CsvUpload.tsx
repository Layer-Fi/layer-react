import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DropZone } from '@ui/DropZone/DropZone'
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
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const onDrop = useCallback(
    ([firstFile, ...restFiles]: File[]) => {
      if (restFiles.length > 0) {
        onFileSelected(null)
        setErrorMessage(t('upload:validation.too_many_files_selected', 'Too many files selected'))
        return
      }

      if (!firstFile) {
        onFileSelected(null)
        setErrorMessage(t('upload:error.unknown_upload_error', 'Unknown upload error'))
        return
      }

      const maybeErrorMessage = validateCsvFile(firstFile, t)
      onFileSelected(maybeErrorMessage ? null : firstFile)
      setErrorMessage(maybeErrorMessage ?? undefined)
    },
    [onFileSelected, t],
  )

  const clearFile = () => onFileSelected(null)

  const dropZoneProps = {
    accept: ['csv'],
    size: 'lg' as const,
    isInvalid: errorMessage !== undefined,
    onDrop,
  }

  return (
    <VStack gap='xs'>
      {file
        ? (
          <DropZone {...dropZoneProps} title={t('upload:label.upload_transactions_csv', 'Upload a CSV of transactions')}>
            {({ open }) => <FileRow name={file.name} sizeInBytes={file.size} isGrouped onReplace={open} onRemove={clearFile} />}
          </DropZone>
        )
        : (
          <DropZone
            {...dropZoneProps}
            title={t('upload:label.upload_transactions_csv', 'Upload a CSV of transactions')}
            description={t('upload:label.drag_or_choose_csv', 'Drag a file here or choose one from your computer. Up to 2 MB.')}
            actionLabel={t('upload:action.choose_csv', 'Choose CSV')}
          />
        )}
      {errorMessage && <Span size='sm' status='error'>{errorMessage}</Span>}
    </VStack>
  )
}
