import { useCallback, useRef, useState } from 'react'
import { FileRejection, useDropzone } from 'react-dropzone'
import { HStack, Spacer, VStack } from '../ui/Stack/Stack'
import { P } from '../ui/Typography/Text'
import UploadCloud from '../../icons/UploadCloud'
import classNames from 'classnames'
import { IconButton } from '../Button'
import { DataState, DataStateStatus } from '../DataState/DataState'
import { FileSpreadsheet } from 'lucide-react'
import CloseIcon from '../../icons/CloseIcon'

const validateCsvFile = (file: File) => {
  const validExtensions = ['.csv']
  const isValidExtension = validExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext),
  )

  if (!isValidExtension) {
    return 'File extension must end in .csv'
  }

  // Check MIME type if it exists
  if (file.type && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
    return `Invalid file type: ${file.type}`
  }

  return null
}

type FileRowProps = {
  file: File
  onClearFile: () => void
}
const FileRow = ({ file, onClearFile }: FileRowProps) => {
  return (
    <HStack align='center' gap='xs' className='Layer__csv-upload__file-row'>
      <FileSpreadsheet size={24} />
      <P size='md'>{file.name}</P>
      <Spacer />
      <IconButton icon={<CloseIcon size={16} />} onClick={onClearFile} />
    </HStack>
  )
}

type CsvUploadProps = {
  file: File | null
  onFileSelected: (file: File | null) => void
}
export const CsvUpload = ({ file, onFileSelected }: CsvUploadProps) => {
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
    ([firstFile, ...restFiles]: File[], rejections: FileRejection[] = []) => {
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
            {'Drag and drop a file, or '}
            <button className='Layer__csv-upload__browse-link' onClick={handleBrowseClick}>
              Browse
            </button>
          </P>
          <input type='file' ref={fileInputRef} style={{ display: 'none' }} accept='.csv' onChange={handleFileChange} />
        </HStack>
        <P size='sm' variant='subtle'>Upload file in CSV format</P>
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
