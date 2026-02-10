import { useCallback, useRef, useState } from 'react'
import classNames from 'classnames'
import { FileSpreadsheet } from 'lucide-react'
import { type FileRejection, useDropzone } from 'react-dropzone'

import CloseIcon from '@icons/CloseIcon'
import UploadCloud from '@icons/UploadCloud'
import { Button } from '@ui/Button/Button'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'

import './csvUpload.scss'

const VALID_EXTENSIONS = ['.csv']
const VALID_FILE_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel']
const MAX_FILE_SIZE = 2 * 1024 * 1024

const validateCsvFile = (file: File) => {
  const isValidExtension = VALID_EXTENSIONS.some(ext =>
    file.name.toLowerCase().endsWith(ext),
  )

  if (!isValidExtension) {
    return 'File extension must end in .csv'
  }

  // Check MIME type if it exists
  if (file.type && !VALID_FILE_TYPES.includes(file.type)) {
    return `Invalid file type: ${file.type}`
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'File exceeds the size limit of 2MB'
  }

  return null
}

type FileRowProps = {
  file: File
  onClearFile: () => void
  asDropTarget?: boolean
}

const FileRow = ({ file, onClearFile, asDropTarget }: FileRowProps) => {
  if (asDropTarget) {
    return (
      <VStack className='Layer__csv-upload__file-row Layer__csv-upload__file-row--drop-target'>
        <HStack>
          <Spacer />
          <Button variant='ghost' inset icon onClick={onClearFile}>
            <CloseIcon size={16} />
          </Button>
        </HStack>
        <HStack align='center' justify='center' gap='xs'>
          <FileSpreadsheet size={24} />
          <P size='md'>{file.name}</P>
        </HStack>
      </VStack>
    )
  }

  return (
    <HStack align='center' gap='xs' className='Layer__csv-upload__file-row'>
      <FileSpreadsheet size={24} />
      <P size='md'>{file.name}</P>
      <Spacer />
      <Button variant='ghost' inset icon onClick={onClearFile}>
        <CloseIcon size={16} />
      </Button>
    </HStack>
  )
}

type CsvUploadProps = {
  file: File | null
  onFileSelected: (file: File | null) => void
  replaceDropTarget?: boolean
}

export const CsvUpload = ({ file, onFileSelected, replaceDropTarget = false }: CsvUploadProps) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleBrowseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    onDrop(fileArray)
  }

  const onDrop = useCallback(
    (files: File[], rejections: FileRejection[] = []) => {
      const [firstFile, ...restFiles] = files
      const hasTooManyFiles = rejections.some(r => r.errors.some(e => e.code === 'too-many-files'))
      if (restFiles.length > 0 || hasTooManyFiles) {
        onFileSelected(null)
        setErrorMessage('Too many files selected')
        return
      }

      if (rejections.length > 0) {
        onFileSelected(null)
        setErrorMessage('Unknown upload error')
        return
      }

      if (!firstFile) {
        onFileSelected(null)
        setErrorMessage('No file selected')
        return
      }

      const maybeErrorMessage = validateCsvFile(firstFile)
      if (!maybeErrorMessage) {
        onFileSelected(firstFile)
        setErrorMessage(undefined)
      }
      else {
        onFileSelected(null)
        setErrorMessage(maybeErrorMessage)
      }
    },
    [onFileSelected],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  })

  if (file && replaceDropTarget) {
    return <FileRow file={file} onClearFile={() => onFileSelected(null)} asDropTarget />
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
          <UploadCloud size={12} />
          <P size='sm'>
            {'Drag and drop a file, or click '}
            <button className='Layer__csv-upload__browse-link' onClick={handleBrowseClick}>
              Browse
            </button>
          </P>
          <input type='file' ref={fileInputRef} style={{ display: 'none' }} accept='.csv' onChange={handleFileChange} />
        </HStack>
        <P size='sm' variant='subtle'>File must be in CSV format</P>
        {errorMessage && (
          <DataState
            className='Layer__csv-upload__error-message'
            status={DataStateStatus.failed}
            title='Cannot upload file'
            description={errorMessage}
            inline
          />
        )}
      </VStack>
      {file && <FileRow file={file} onClearFile={() => onFileSelected(null)} />}
    </VStack>
  )
}
