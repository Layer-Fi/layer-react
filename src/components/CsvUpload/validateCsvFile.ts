import type { TFunction } from 'i18next'

const VALID_EXTENSIONS = ['.csv']
const VALID_FILE_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel']
const MAX_FILE_SIZE = 2 * 1024 * 1024

export const validateCsvFile = (file: File, t: TFunction) => {
  const isValidExtension = VALID_EXTENSIONS.some(ext =>
    file.name.toLowerCase().endsWith(ext),
  )

  if (!isValidExtension) {
    return t('upload:validation.file_extension_must_end_in_csv', 'File extension must end in .csv')
  }

  if (file.type && !VALID_FILE_TYPES.includes(file.type)) {
    return t('upload:validation.file_type_invalid', 'Invalid file type: {{type}}', { type: file.type })
  }

  if (file.size > MAX_FILE_SIZE) {
    return t('upload:validation.file_exceeds_size_limit', 'File exceeds the size limit of 2MB')
  }

  return null
}
