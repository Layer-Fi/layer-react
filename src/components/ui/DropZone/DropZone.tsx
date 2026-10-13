import { type ReactNode } from 'react'
import { useDropzone } from 'react-dropzone'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { DropZonePrompt, type DropZonePromptProps, type DropZoneSize } from '@ui/DropZone/DropZonePrompt'
import { createFileValidator, type DropZoneRejection, toDropZoneRejection } from '@ui/DropZone/dropZoneValidation'
import { VStack } from '@ui/Stack/Stack'

import './dropZone.scss'

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

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    multiple,
    maxFiles: maxFiles ?? 0,
    maxSize: maxFileSizeInBytes,
    validator: createFileValidator({ extensions, validate }),
    // Keeps its drop handlers while disabled so the browser doesn't open a dropped file in the tab.
    onDrop: (accepted, rejections) => {
      if (!isDisabled) onDrop(accepted, rejections.map(toDropZoneRejection))
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
      {prompt && <DropZonePrompt {...prompt} size={size} isDragging={isDragging} isDisabled={isDisabled} onOpen={openIfEnabled} />}
      <input {...getInputProps()} accept={extensions.map(extension => `.${extension}`).join(',')} />
    </VStack>
  )
}
