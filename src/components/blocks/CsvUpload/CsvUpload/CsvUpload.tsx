import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { DropZone, type DropZoneProps } from '@ui/DropZone/DropZone'
import { FileRow } from '@ui/FileRow/FileRow'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { CSV_MAX_FILE_SIZE_IN_BYTES, validateCsvFile } from '@blocks/CsvUpload/CsvUpload/validateCsvFile'

type CsvUploadProps = {
  file: File | null
  onFileSelected: (file: File | null) => void
}

export const CsvUpload = ({ file, onFileSelected }: CsvUploadProps) => {
  const { t } = useTranslation()
  const { formatFileSize } = useIntlFormatter()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  // A rejected drop reports the problem and leaves any already-chosen file in place.
  const onDrop = ([firstFile, ...restFiles]: File[]) => {
    if (restFiles.length > 0) {
      setErrorMessage(t('upload:validation.too_many_files_selected', 'Too many files selected'))
      return
    }

    if (!firstFile) {
      setErrorMessage(t('upload:error.unknown_upload_error', 'Unknown upload error'))
      return
    }

    const maybeErrorMessage = validateCsvFile({ file: firstFile, t, formatFileSize })
    setErrorMessage(maybeErrorMessage ?? undefined)
    if (!maybeErrorMessage) onFileSelected(firstFile)
  }

  const clearFile = () => {
    setErrorMessage(undefined)
    onFileSelected(null)
  }

  const title = t('upload:label.upload_transactions_csv', 'Upload a CSV of transactions')

  const dropZoneProps: Pick<DropZoneProps, 'accept' | 'size' | 'isInvalid' | 'onDrop' | 'title'> = {
    accept: ['csv'],
    size: 'lg',
    isInvalid: errorMessage !== undefined,
    onDrop,
    title,
  }

  return (
    <VStack gap='xs'>
      {file
        ? (
          <DropZone {...dropZoneProps}>
            {({ open }) => <FileRow name={file.name} sizeInBytes={file.size} isGrouped onReplace={open} onRemove={clearFile} />}
          </DropZone>
        )
        : (
          <DropZone
            {...dropZoneProps}
            description={t('upload:label.drag_or_choose_csv', 'Drag a file here or choose one from your computer. Up to {{maxSize}}.', {
              maxSize: formatFileSize(CSV_MAX_FILE_SIZE_IN_BYTES),
            })}
            actionLabel={t('upload:action.choose_csv', 'Choose CSV')}
          />
        )}
      {errorMessage && <Span size='sm' status='error'>{errorMessage}</Span>}
    </VStack>
  )
}
