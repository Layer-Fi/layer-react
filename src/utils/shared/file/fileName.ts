export const getFileExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex > 0 ? fileName.slice(dotIndex + 1).toLowerCase() : ''
}

export const splitFileName = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex <= 0) return { stem: fileName, extension: '' }

  return { stem: fileName.slice(0, dotIndex), extension: fileName.slice(dotIndex) }
}

const MIME_TYPES_BY_EXTENSION: Record<string, ReadonlyArray<string>> = {
  pdf: ['application/pdf'],
  png: ['image/png'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  heic: ['image/heic'],
  csv: ['text/csv', 'application/vnd.ms-excel'],
  txt: ['text/plain'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

/**
 * The `accept` map react-dropzone uses to flag a wrong file type while it is still being dragged.
 * Undefined when any extension has no known MIME type, so an unfamiliar type is never shown as rejected.
 */
export const toDropzoneAccept = (extensions: ReadonlyArray<string>) => {
  if (extensions.length === 0) return undefined

  const accept: Record<string, string[]> = {}
  for (const extension of extensions) {
    const mimeTypes = MIME_TYPES_BY_EXTENSION[extension.toLowerCase()]
    if (!mimeTypes) return undefined

    for (const mimeType of mimeTypes) {
      accept[mimeType] = [...(accept[mimeType] ?? []), `.${extension.toLowerCase()}`]
    }
  }
  return accept
}
