import { useState } from 'react'

import { DropZone } from '@ui/DropZone/DropZone'
import { type DropZoneRejection } from '@ui/DropZone/dropZoneValidation'
import { FileRow } from '@ui/FileRow/FileRow'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { formFieldLayoutProps, FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import { type CommonFormFieldProps, type UploadedFile } from '@blocks/Form/types'
import { useFileUploadMessages } from '@blocks/Form/useFileUploadMessages'
import { type UploadFiles, usePendingUploads } from '@blocks/Form/usePendingUploads'

import './formFileUploadField.scss'

import { useFieldContext } from './formContexts'

export type FormFileUploadFieldProps = CommonFormFieldProps & {
  /** File extensions without the dot; empty accepts any file. */
  accept: ReadonlyArray<string>
  multiple?: boolean
  /** The most files the field holds; only applies with `multiple`. */
  maxFiles?: number
  maxFileSizeInBytes?: number
  /** Resolves with the files the server stored, or null when the upload failed. */
  upload: UploadFiles
  /** Awaited before a listed file leaves the list; a rejection keeps the file and reports the failure. */
  remove?: (file: UploadedFile) => Promise<void>
}

const removeLocally = () => Promise.resolve()

const appendSentence = (current: string | undefined, sentence: string) => (current ? `${current} ${sentence}` : sentence)

export function FormFileUploadField({
  accept,
  multiple = false,
  maxFiles,
  maxFileSizeInBytes,
  upload,
  remove = removeLocally,
  ...props
}: FormFileUploadFieldProps) {
  const field = useFieldContext<UploadedFile[]>()
  const [error, setError] = useState<string | undefined>(undefined)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { pending, startUpload } = usePendingUploads(upload)

  const { labelId, isInvalid, shellProps } = useFormField({ ...props, errorText: props.errorText ?? error })
  const { className, inline, align, showLabel, isDisabled = false, isReadOnly = false } = props

  const files = field.state.value
  const heldCount = files.length + pending.length
  const fileLimit = multiple ? maxFiles : 1
  const remaining = multiple && fileLimit !== undefined ? fileLimit - heldCount : undefined
  const isAtLimit = remaining !== undefined && remaining <= 0
  const isInputDisabled = isDisabled || pending.length > 0 || removingId !== null

  const messages = useFileUploadMessages({ accept, multiple, maxFileSizeInBytes, heldCount, fileLimit, remaining })

  const uploadFiles = async (accepted: ReadonlyArray<File>) => {
    const uploaded = await startUpload(accepted)
    if (!uploaded) {
      setError(current => appendSentence(current, messages.uploadFailed))
      return
    }
    field.handleChange(multiple ? [...field.state.value, ...uploaded] : uploaded)
  }

  const onDrop = (accepted: ReadonlyArray<File>, rejections: ReadonlyArray<DropZoneRejection>) => {
    setError(messages.getRejectionMessage(rejections))
    if (accepted.length > 0) void uploadFiles(accepted)
  }

  const removeFile = async (file: UploadedFile) => {
    setError(undefined)
    setRemovingId(file.id)
    const isRemoved = await remove(file).then(() => true, () => false)
    setRemovingId(null)

    if (isRemoved) field.handleChange(field.state.value.filter(({ id }) => id !== file.id))
    else setError(messages.removeFailed)
  }

  const renderRows = ({ open }: { open: () => void }) => {
    // A single file's row gives way to its replacement's while that uploads.
    const shownFiles = !multiple && pending.length > 0 ? [] : files

    return (
      <>
        {shownFiles.map(file => (
          <FileRow
            key={file.id}
            name={file.name}
            sizeInBytes={file.sizeInBytes}
            isRemoving={removingId === file.id}
            isDisabled={isInputDisabled}
            onReplace={multiple ? undefined : open}
            onRemove={() => void removeFile(file)}
          />
        ))}
        {pending.map(({ key, file }) => <FileRow key={key} name={file.name} sizeInBytes={file.size} isUploading />)}
        {messages.limitNotice && (
          <Span size='sm' variant='subtle' pi='md' pb='sm' className='Layer__FormFileUploadField__LimitNotice'>
            {messages.limitNotice}
          </Span>
        )}
      </>
    )
  }

  const renderControl = () => {
    if (isReadOnly) {
      if (files.length === 0) return <Span variant='subtle'>{messages.noFiles}</Span>

      return (
        <VStack className='Layer__FormFileUploadField__List'>
          {files.map(({ id, name, sizeInBytes }) => <FileRow key={id} name={name} sizeInBytes={sizeInBytes} />)}
        </VStack>
      )
    }

    const showsPrompt = multiple ? !isAtLimit : heldCount === 0

    return (
      <DropZone
        accept={accept}
        multiple={multiple}
        maxFiles={remaining}
        maxFileSizeInBytes={maxFileSizeInBytes}
        isDisabled={isInputDisabled || isAtLimit}
        isInvalid={isInvalid}
        onDrop={onDrop}
        prompt={showsPrompt ? messages.prompt : undefined}
      >
        {heldCount > 0 ? renderRows : undefined}
      </DropZone>
    )
  }

  return (
    <div {...formFieldLayoutProps({ className, inline, align, showLabel })}>
      <FormFieldShell {...shellProps} labelId={labelId}>
        {renderControl()}
      </FormFieldShell>
    </div>
  )
}
