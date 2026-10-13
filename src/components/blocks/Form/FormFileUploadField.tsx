import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/shared/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { DropZone, type DropZonePromptProps, type DropZoneRejection } from '@ui/DropZone/DropZone'
import { FileRow } from '@ui/FileRow/FileRow'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { formFieldLayoutProps, FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import './formFileUploadField.scss'

import { useFieldContext } from './formContexts'

export type UploadedFile = { id: string, name: string, sizeInBytes?: number }

export type FormFileUploadFieldProps = Omit<CommonFormFieldProps, 'errorText'> & {
  /** File extensions without the dot; empty accepts any file. */
  accept: ReadonlyArray<string>
  multiple?: boolean
  /** The most files the field holds; only applies with `multiple`. */
  maxFiles?: number
  maxFileSizeInBytes?: number
  /** Resolves with the files the server stored, or null when the upload failed. */
  upload: (files: ReadonlyArray<File>) => Promise<ReadonlyArray<UploadedFile> | null>
}

type PendingFile = { key: string, file: File }

const toPending = (file: File): PendingFile => ({ key: crypto.randomUUID(), file })

export function FormFileUploadField({ accept, multiple = false, maxFiles, maxFileSizeInBytes, upload, ...props }: FormFileUploadFieldProps) {
  const { t } = useTranslation()
  const { formatList, formatNumber, formatFileSize } = useIntlFormatter()
  const field = useFieldContext<UploadedFile[]>()
  const [error, setError] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState<ReadonlyArray<PendingFile>>([])
  const { isMobile } = useSizeClass()

  const { labelId, isInvalid, shellProps } = useFormField({ ...props, errorText: error })
  const { className, inline, align, showLabel, isDisabled = false, isReadOnly = false } = props

  const files = field.state.value
  const isUploading = pending.length > 0
  const isInputDisabled = isDisabled || isUploading
  const fileLimit = multiple ? maxFiles : 1
  const heldCount = files.length + pending.length
  const remaining = multiple && maxFiles !== undefined ? maxFiles - heldCount : undefined
  const isAtLimit = remaining !== undefined && remaining <= 0

  const fileTypes = accept.length > 0
    ? formatList(accept.map(extension => extension.toUpperCase()), { type: 'disjunction' })
    : null

  const uploadPending = async (toUpload: ReadonlyArray<PendingFile>) => {
    const keys = new Set(toUpload.map(({ key }) => key))
    setPending(current => [...current, ...toUpload])

    const uploaded = await upload(toUpload.map(({ file }) => file)).catch(() => null)
    setPending(current => current.filter(({ key }) => !keys.has(key)))

    if (!uploaded) {
      const uploadFailed = t('blocks:Form.FormFileUploadField.error.upload_failed', 'Some files couldn’t be uploaded. Try again.')
      setError(current => (current ? `${current} ${uploadFailed}` : uploadFailed))
      return
    }

    const sizeByName = new Map(toUpload.map(({ file }) => [file.name, file.size]))
    const withSizes = uploaded.map(stored => ({ sizeInBytes: sizeByName.get(stored.name), ...stored }))
    field.handleChange(multiple ? [...field.state.value, ...withSizes] : withSizes)
  }

  const getOverLimitError = (limit: number) => {
    if (remaining !== undefined && remaining < limit) {
      return tPlural(t, 'blocks:Form.FormFileUploadField.error.over_remaining_capacity', {
        count: remaining,
        displayCount: formatNumber(remaining),
        one: 'You can add {{displayCount}} more file.',
        other: 'You can add {{displayCount}} more files.',
      })
    }
    return tPlural(t, 'blocks:Form.FormFileUploadField.error.too_many_files', {
      count: limit,
      displayCount: formatNumber(limit),
      one: 'Upload {{displayCount}} file at a time.',
      other: 'Upload up to {{displayCount}} files at a time.',
    })
  }

  const getRejectionError = (rejections: ReadonlyArray<DropZoneRejection>) => {
    const hasReason = (reason: DropZoneRejection['reason']) => rejections.some(rejection => rejection.reason === reason)
    const tooLarge = rejections.filter(({ reason }) => reason === 'size').map(({ file }) => file)
    const [firstTooLarge] = tooLarge

    const errors = [
      hasReason('type') && fileTypes
        ? t('blocks:Form.FormFileUploadField.error.files_not_added', 'Some files couldn’t be added. Upload a {{fileTypes}} file instead.', { fileTypes })
        : null,
      firstTooLarge && maxFileSizeInBytes !== undefined
        ? tPlural(t, 'blocks:Form.FormFileUploadField.error.file_too_large', {
          count: tooLarge.length,
          fileName: firstTooLarge.name,
          fileSize: formatFileSize(firstTooLarge.size),
          maxSize: formatFileSize(maxFileSizeInBytes),
          one: '{{fileName}} is {{fileSize}}. Files must be under {{maxSize}}.',
          other: 'Some files are too large. Files must be under {{maxSize}}.',
        })
        : null,
      hasReason('count') && fileLimit !== undefined
        ? getOverLimitError(fileLimit)
        : null,
    ].filter(message => message !== null)

    return errors.length > 0 ? errors.join(' ') : undefined
  }

  const onDrop = (accepted: ReadonlyArray<File>, rejections: ReadonlyArray<DropZoneRejection>) => {
    setError(getRejectionError(rejections))
    if (accepted.length > 0) void uploadPending(accepted.map(toPending))
  }

  const removeFile = (id: string) => field.handleChange(files.filter(file => file.id !== id))

  const getDescription = () => {
    const addedCount = multiple && fileLimit !== undefined && heldCount > 0
      ? t('blocks:Form.FormFileUploadField.label.added_count', '{{count}} of {{limit}} added', { count: heldCount, limit: formatNumber(fileLimit) })
      : null
    const sizeLimit = maxFileSizeInBytes === undefined
      ? null
      : t('blocks:Form.FormFileUploadField.label.max_size', 'Up to {{maxSize}}', { maxSize: formatFileSize(maxFileSizeInBytes) })

    return [addedCount, fileTypes ?? t('blocks:Form.FormFileUploadField.label.any_file_type', 'Any file type'), sizeLimit]
      .filter(part => part !== null)
      .join(' · ')
  }

  const getPrompt = (): DropZonePromptProps => {
    const description = getDescription()

    if (isMobile) {
      return {
        title: multiple
          ? t('blocks:Form.FormFileUploadField.action.add_files', 'Add files')
          : t('blocks:Form.FormFileUploadField.action.add_file', 'Add a file'),
        description,
      }
    }
    if (!multiple) {
      return {
        title: t('blocks:Form.FormFileUploadField.label.drop_file', 'Drag a file here'),
        description,
        actionLabel: t('blocks:Form.FormFileUploadField.action.choose_file', 'Choose file'),
      }
    }
    if (heldCount > 0) {
      return {
        title: t('blocks:Form.FormFileUploadField.label.drop_more_files', 'Drag more files here'),
        description,
        actionLabel: t('blocks:Form.FormFileUploadField.action.add_files', 'Add files'),
      }
    }
    return {
      title: t('blocks:Form.FormFileUploadField.label.drop_files', 'Drag files here'),
      description,
      actionLabel: t('blocks:Form.FormFileUploadField.action.choose_files', 'Choose files'),
    }
  }

  const renderRows = ({ open }: { open: () => void }) => {
    const pendingRows = pending.map(({ key, file }) => <FileRow key={key} name={file.name} sizeInBytes={file.size} isUploading />)
    const uploadedRows = files.map(({ id, name, sizeInBytes }) => (
      <FileRow
        key={id}
        name={name}
        sizeInBytes={sizeInBytes}
        isDisabled={isInputDisabled}
        onReplace={multiple ? undefined : open}
        onRemove={() => removeFile(id)}
      />
    ))

    if (!multiple) return isUploading ? pendingRows : uploadedRows

    return (
      <>
        {uploadedRows}
        {pendingRows}
        {isAtLimit && fileLimit !== undefined && (
          <Span size='sm' variant='subtle' pi='md' pb='sm' className='Layer__FormFileUploadField__LimitNotice'>
            {t('blocks:Form.FormFileUploadField.label.at_limit', '{{count}} of {{limit}} files added. Remove one to add another.', {
              count: heldCount,
              limit: formatNumber(fileLimit),
            })}
          </Span>
        )}
      </>
    )
  }

  const renderControl = () => {
    if (isReadOnly) {
      if (files.length === 0) return <Span variant='subtle'>{t('blocks:Form.FormFileUploadField.label.no_files', 'No files uploaded')}</Span>

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
        prompt={showsPrompt ? getPrompt() : undefined}
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
