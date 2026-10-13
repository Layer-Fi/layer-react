import { type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { CloudUpload } from 'lucide-react'
import { ErrorCode, type FileError, type FileRejection, useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'

import { getFileExtension } from '@utils/shared/file/fileName'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Button } from '@ui/Button/Button'
import { HStack, type StackProps, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './dropZone.scss'

const INVALID_FILE_ERROR_CODE = 'invalid-file'

/** `invalid` carries the `validate` message; the rest have an empty one. */
export type DropZoneRejection = { file: File, reason: 'invalid' | 'type' | 'size' | 'count', message: string }

export type DropZonePromptProps = {
  title: string
  description?: string
  /** Without one, the whole prompt is the tap target. */
  actionLabel?: string
}

type DropZoneSize = 'md' | 'lg'

export type DropZoneProps = {
  /** File extensions without the dot; empty accepts any file. Filters the picker and rejects other files. */
  accept?: ReadonlyArray<string>
  multiple?: boolean
  maxFiles?: number
  maxFileSizeInBytes?: number
  /** Returns a message to reject the file with. */
  validate?: (file: File) => string | null
  onDrop: (accepted: File[], rejections: DropZoneRejection[]) => void
  prompt?: DropZonePromptProps
  size?: DropZoneSize
  isDisabled?: boolean
  isInvalid?: boolean
  /** Content rendered above the prompt, such as the rows of files already added. */
  children?: (renderProps: { open: () => void }) => ReactNode
}

const REASON_BY_CODE = new Map<string, DropZoneRejection['reason']>([
  [INVALID_FILE_ERROR_CODE, 'invalid'],
  [ErrorCode.FileInvalidType, 'type'],
  [ErrorCode.FileTooLarge, 'size'],
  [ErrorCode.TooManyFiles, 'count'],
])

// The validator adds at most one error, after react-dropzone's size error, and it is the more specific of the two.
const toRejection = ({ file, errors }: FileRejection): DropZoneRejection => {
  const error: FileError | undefined = errors[errors.length - 1]
  return { file, reason: (error && REASON_BY_CODE.get(error.code)) ?? 'invalid', message: error?.message ?? '' }
}

const isFromButton = (event: MouseEvent<HTMLElement>) => event.target instanceof Element && event.target.closest('button') !== null

type PromptProps = DropZonePromptProps & {
  size: DropZoneSize
  isDragging: boolean
  isDisabled: boolean
  onOpen: () => void
}

const Prompt = ({ title, description, actionLabel, size, isDragging, isDisabled, onOpen }: PromptProps) => {
  const { t } = useTranslation()
  const isPressable = actionLabel === undefined
  const isLarge = size === 'lg'
  const Layout = isLarge ? VStack : HStack
  const padding: Pick<StackProps, 'pi' | 'pb'> = isPressable
    ? { pi: 'sm', pb: 'sm' }
    : isLarge ? { pi: 'lg', pb: 'xl' } : { pi: 'md', pb: 'md' }
  const textStatus = isDisabled ? 'disabled' : undefined
  const textAlign = isLarge ? 'center' : undefined

  const interactionProps = {
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (!isFromButton(event)) onOpen()
    },
    ...(isPressable && {
      'role': 'button',
      'tabIndex': isDisabled ? undefined : 0,
      'aria-label': title,
      'aria-disabled': isDisabled || undefined,
      'onKeyDown': (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onOpen()
      },
    }),
  }

  return (
    <Layout
      className='Layer__UI__DropZone__Prompt'
      {...toDataProperties({ pressable: isPressable, disabled: isDisabled })}
      {...padding}
      {...interactionProps}
      align='center'
      gap='sm'
    >
      <HStack className='Layer__UI__DropZone__Icon' {...toDataProperties({ size, dragging: isDragging, disabled: isDisabled })} align='center' justify='center'>
        <CloudUpload size={isLarge ? 20 : 16} />
      </HStack>
      <VStack fluid align={textAlign} gap='4xs'>
        <Span weight={isDragging || isLarge ? 'bold' : undefined} status={textStatus} align={textAlign}>
          {isDragging ? t('ui:DropZone.label.drop_to_upload', 'Drop to upload') : title}
        </Span>
        {description && <Span size='sm' variant={textStatus ? undefined : 'subtle'} status={textStatus} align={textAlign}>{description}</Span>}
      </VStack>
      {!isDragging && actionLabel && (
        <Button variant='outlined' isDisabled={isDisabled} onPress={onOpen}>
          {actionLabel}
        </Button>
      )}
    </Layout>
  )
}

export const DropZone = ({
  accept = [],
  multiple = false,
  maxFiles,
  maxFileSizeInBytes,
  validate,
  onDrop,
  prompt,
  size = 'md',
  isDisabled = false,
  isInvalid = false,
  children,
}: DropZoneProps) => {
  const extensions = accept.map(extension => extension.toLowerCase())

  const validator = (file: File): FileError | null => {
    // Also runs on dragged items, which are not yet files and carry no name.
    if (!(file instanceof File)) return null

    const message = validate?.(file)
    if (message) return { code: INVALID_FILE_ERROR_CODE, message }
    if (extensions.length > 0 && !extensions.includes(getFileExtension(file.name))) return { code: ErrorCode.FileInvalidType, message: '' }
    return null
  }

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    multiple,
    maxFiles: maxFiles ?? 0,
    maxSize: maxFileSizeInBytes,
    validator,
    // Keeps its drop handlers while disabled so the browser doesn't open a dropped file in the tab.
    onDrop: (accepted, rejections) => {
      if (!isDisabled) onDrop(accepted, rejections.map(toRejection))
    },
    noClick: true,
    noKeyboard: true,
  })

  const isDragging = isDragActive && !isDisabled

  const openIfEnabled = () => {
    if (!isDisabled) open()
  }

  return (
    <VStack
      className='Layer__UI__DropZone'
      {...toDataProperties({ dragging: isDragging, invalid: isInvalid, disabled: isDisabled, filled: children !== undefined })}
      {...getRootProps()}
    >
      {children?.({ open: openIfEnabled })}
      {prompt && <Prompt {...prompt} size={size} isDragging={isDragging} isDisabled={isDisabled} onOpen={openIfEnabled} />}
      <input {...getInputProps()} accept={extensions.map(extension => `.${extension}`).join(',')} />
    </VStack>
  )
}
