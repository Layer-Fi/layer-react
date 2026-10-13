import { ErrorCode, type FileError, type FileRejection } from 'react-dropzone'

import { getFileExtension } from '@utils/shared/file/fileName'

const INVALID_FILE_ERROR_CODE = 'invalid-file'

/** `invalid` carries the `validate` message; the rest have an empty one. */
export type DropZoneRejection = { file: File, reason: 'invalid' | 'type' | 'size' | 'count', message: string }

const REASON_BY_CODE = new Map<string, DropZoneRejection['reason']>([
  [INVALID_FILE_ERROR_CODE, 'invalid'],
  [ErrorCode.FileInvalidType, 'type'],
  [ErrorCode.FileTooLarge, 'size'],
  [ErrorCode.TooManyFiles, 'count'],
])

type FileValidatorOptions = {
  /** Lowercase extensions without the dot; empty accepts any file. */
  extensions: ReadonlyArray<string>
  validate?: (file: File) => string | null
}

/** Builds react-dropzone's `validator`, which also runs on dragged items before they are files with a name. */
export const createFileValidator = ({ extensions, validate }: FileValidatorOptions) => (file: File): FileError | null => {
  if (!(file instanceof File)) return null

  const message = validate?.(file)
  if (message) return { code: INVALID_FILE_ERROR_CODE, message }
  if (extensions.length > 0 && !extensions.includes(getFileExtension(file.name))) return { code: ErrorCode.FileInvalidType, message: '' }
  return null
}

// The validator adds at most one error, after react-dropzone's size error, and it is the more specific of the two.
export const toDropZoneRejection = ({ file, errors }: FileRejection): DropZoneRejection => {
  const error: FileError | undefined = errors[errors.length - 1]
  return { file, reason: (error && REASON_BY_CODE.get(error.code)) ?? 'invalid', message: error?.message ?? '' }
}
