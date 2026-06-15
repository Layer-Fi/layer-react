import { useCallback, useRef, useState } from 'react'
import classNames from 'classnames'
import { CloudUpload } from 'lucide-react'
import { type FileRejection, useDropzone } from 'react-dropzone'
import { Trans, useTranslation } from 'react-i18next'

import { HStack, VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { CsvUploadFileRow } from '@components/CsvUpload/CsvUploadFileRow'
import { validateCsvFile } from '@components/CsvUpload/validateCsvFile'
import { DataState, DataStateStatus } from '@components/DataState/DataState'

import './csvUpload.scss'

type CsvUploadProps = {
  file: File | null
  onFileSelected: (file: File | null) => void
  replaceDropTarget?: boolean
}

export const CsvUpload = ({ file, onFileSelected, replaceDropTarget = false }: CsvUploadProps) => {
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleBrowseClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    fileInputRef.current?.click()
  }, [])

  const onDrop = useCallback(
    ([firstFile, ...restFiles]: File[], rejections: FileRejection[] = []) => {
      const hasTooManyFiles = rejections.some(r => r.errors.some(e => e.code === 'too-many-files'))
      if (restFiles.length > 0 || hasTooManyFiles) {
        onFileSelected(null)
        setErrorMessage(t('upload:validation.too_many_files_selected', 'Too many files selected'))
        return
      }

      if (rejections.length > 0) {
        onFileSelected(null)
        setErrorMessage(t('upload:error.unknown_upload_error', 'Unknown upload error'))
        return
      }

      const maybeErrorMessage = validateCsvFile(firstFile, t)
      if (!maybeErrorMessage) {
        onFileSelected(firstFile)
        setErrorMessage(undefined)
      }
      else {
        onFileSelected(null)
        setErrorMessage(maybeErrorMessage)
      }
    },
    [onFileSelected, t],
  )

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    onDrop(fileArray)
  }, [onDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  })

  if (file && replaceDropTarget) {
    return <CsvUploadFileRow file={file} onClearFile={() => onFileSelected(null)} asDropTarget />
  }

  return (
    <VStack gap='xs'>
      <VStack
        className={classNames(
          'Layer__csv-upload',
          { 'Layer__csv-upload--drag-active': isDragActive },
        )}
        align='center'
        justify='center'
        gap='xs'
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <HStack align='center' gap='xs'>
          <CloudUpload size={12} />
          <P size='sm'>
            <Trans
              i18nKey='upload:label.drag_drop_file_browse'
              defaults='Drag and drop a file, or <browse>Browse</browse>.'
              components={{
                browse: <button type='button' className='Layer__csv-upload__browse-link' onClick={handleBrowseClick} />,
              }}
            />
          </P>
          <input type='file' ref={fileInputRef} style={{ display: 'none' }} accept='.csv' onChange={handleFileChange} />
        </HStack>
        <P size='sm' variant='subtle'>{t('upload:validation.file_must_be_csv', 'File must be in CSV format')}</P>
        {errorMessage && (
          <DataState
            className='Layer__csv-upload__error-message'
            status={DataStateStatus.failed}
            title={t('upload:error.cannot_upload_file', 'Cannot upload file')}
            description={errorMessage}
            inline
          />
        )}
      </VStack>
      {file && <CsvUploadFileRow file={file} onClearFile={() => onFileSelected(null)} />}
    </VStack>
  )
}
