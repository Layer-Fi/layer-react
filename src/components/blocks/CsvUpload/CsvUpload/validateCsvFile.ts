import type { TFunction } from 'i18next'

import { type FileSizeFormatFn } from '@utils/shared/i18n/number/formatters'

const VALID_EXTENSIONS = ['.csv']
const VALID_FILE_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel']
const CSV_MAX_FILE_SIZE_IN_BYTES = 2_000_000

type ValidateCsvFileOptions = {
  file: File
  t: TFunction
  formatFileSize: FileSizeFormatFn
}

export const validateCsvFile = ({ file, t, formatFileSize }: ValidateCsvFileOptions) => {
  const isValidExtension = VALID_EXTENSIONS.some(ext =>
    file.name.toLowerCase().endsWith(ext),
  )

  if (!isValidExtension) {
    return t('upload:validation.file_extension_must_end_in_csv', 'File extension must end in .csv')
  }

  if (file.type && !VALID_FILE_TYPES.includes(file.type)) {
    return t('upload:validation.file_type_invalid', 'Invalid file type: {{type}}', { type: file.type })
  }

  if (file.size > CSV_MAX_FILE_SIZE_IN_BYTES) {
    return t('upload:validation.file_exceeds_max_size', 'File exceeds the size limit of {{maxSize}}', { maxSize: formatFileSize(CSV_MAX_FILE_SIZE_IN_BYTES) })
  }

  return null
}
