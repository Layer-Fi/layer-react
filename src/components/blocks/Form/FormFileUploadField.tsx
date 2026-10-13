import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getFileExtension } from '@utils/shared/file/fileName'
import { type DateInput } from '@utils/shared/i18n/date/input'
import { tPlural } from '@utils/shared/i18n/plural'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { DropZone } from '@ui/DropZone/DropZone'
import { FileRow } from '@ui/FileRow/FileRow'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { formFieldLayoutProps, FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import './formFileUploadField.scss'

import { useFieldContext } from './formContexts'

export type UploadedFile = {
  id: string
  name: string
  sizeInBytes?: number
  addedAt?: DateInput
  href?: string
}

export type FormFileUploadFieldProps = Omit<CommonFormFieldProps, 'errorText'> & {
  /** File extensions without the dot; empty accepts any file. */
  accept: ReadonlyArray<string>
  multiple?: boolean
  /** The most files the field holds; only applies with `multiple`. */
  maxFiles?: number
  maxFileSizeInBytes?: number
  /** Resolves with the files the server stored, in the order sent, or null when the upload failed. */
  upload: (files: ReadonlyArray<File>) => Promise<ReadonlyArray<UploadedFile> | null>
}

type PendingFile = { key: string, file: File, status: 'uploading' | 'failed' }

const toPending = (file: File): PendingFile => ({ key: crypto.randomUUID(), file, status: 'uploading' })

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
  const extensions = accept.map(extension => extension.toLowerCase())
  const isUploading = pending.some(({ status }) => status === 'uploading')
  const isInputDisabled = isDisabled || isUploading
  const fileLimit = multiple ? maxFiles : 1
  const heldCount = files.length + pending.length
  const isAtLimit = multiple && fileLimit !== undefined && heldCount >= fileLimit

  const fileTypes = extensions.length > 0
    ? formatList(extensions.map(extension => extension.toUpperCase()), { type: 'disjunction' })
    : null

  const uploadPending = async (toUpload: ReadonlyArray<PendingFile>) => {
    const keys = new Set(toUpload.map(({ key }) => key))
    setPending(current => [
      ...current.filter(({ key }) => !keys.has(key)),
      ...toUpload.map(item => ({ ...item, status: 'uploading' as const })),
    ])

    const uploaded = await upload(toUpload.map(({ file }) => file)).catch(() => null)

    if (!uploaded) {
      setPending(current => current.map(item => (keys.has(item.key) ? { ...item, status: 'failed' } : item)))
      return
    }

    setPending(current => current.filter(({ key }) => !keys.has(key)))
    const withSizes = uploaded.map((stored, index) => ({ sizeInBytes: toUpload[index]?.file.size, ...stored }))
    field.handleChange(multiple ? [...field.state.value, ...withSizes] : withSizes)
  }

  const onSelect = (selected: ReadonlyArray<File>) => {
    const isAccepted = (file: File) => extensions.length === 0 || extensions.includes(getFileExtension(file.name))
    const isWithinSize = (file: File) => maxFileSizeInBytes === undefined || file.size <= maxFileSizeInBytes

    const wrongType = selected.filter(file => !isAccepted(file))
    const tooLarge = selected.filter(file => isAccepted(file) && !isWithinSize(file))
    const valid = selected.filter(file => isAccepted(file) && isWithinSize(file))
    const capacity = fileLimit === undefined ? Infinity : multiple ? fileLimit - heldCount : 1
    const isOverLimit = valid.length > capacity
    const [firstTooLarge] = tooLarge

    const errors = [
      wrongType.length > 0 && fileTypes
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
      isOverLimit && fileLimit !== undefined
        ? tPlural(t, 'blocks:Form.FormFileUploadField.error.too_many_files', {
          count: fileLimit,
          displayCount: formatNumber(fileLimit),
          one: 'Upload {{displayCount}} file at a time.',
          other: 'Upload up to {{displayCount}} files at a time.',
        })
        : null,
    ].filter(message => message !== null)

    setError(errors.length > 0 ? errors.join(' ') : undefined)

    if (isOverLimit || valid.length === 0) return
    if (!multiple) setPending([])
    void uploadPending(valid.map(toPending))
  }

  const removeFile = (id: string) => field.handleChange(files.filter(file => file.id !== id))
  const removePending = (key: string) => setPending(current => current.filter(item => item.key !== key))

  const getDescription = () => {
    const sizePart = maxFileSizeInBytes === undefined
      ? null
      : multiple
        ? t('blocks:Form.FormFileUploadField.label.max_size_each', 'Up to {{maxSize}} each', { maxSize: formatFileSize(maxFileSizeInBytes) })
        : t('blocks:Form.FormFileUploadField.label.max_size', 'Up to {{maxSize}}', { maxSize: formatFileSize(maxFileSizeInBytes) })

    const countPart = multiple && fileLimit !== undefined
      ? (heldCount > 0
        ? t('blocks:Form.FormFileUploadField.label.added_count', '{{count}} of {{limit}} added', { count: heldCount, limit: formatNumber(fileLimit) })
        : tPlural(t, 'blocks:Form.FormFileUploadField.label.max_files', {
          count: fileLimit,
          displayCount: formatNumber(fileLimit),
          one: 'Up to {{displayCount}} file',
          other: 'Up to {{displayCount}} files',
        }))
      : null

    return [
      heldCount > 0 ? countPart : null,
      fileTypes ?? t('blocks:Form.FormFileUploadField.label.any_file_type', 'Any file type'),
      sizePart,
      heldCount === 0 && !sizePart ? countPart : null,
    ].filter(part => part !== null).join(' · ')
  }

  const getTitle = () => {
    if (isMobile) {
      return multiple
        ? t('blocks:Form.FormFileUploadField.action.add_files', 'Add files')
        : t('blocks:Form.FormFileUploadField.action.add_file', 'Add a file')
    }
    if (!multiple) return t('blocks:Form.FormFileUploadField.label.drop_file', 'Drag a file here')
    if (heldCount > 0) return t('blocks:Form.FormFileUploadField.label.drop_more_files', 'Drag more files here')
    return t('blocks:Form.FormFileUploadField.label.drop_files', 'Drag files here')
  }

  const getActionLabel = () => {
    if (isMobile) return undefined
    if (!multiple) return t('blocks:Form.FormFileUploadField.action.choose_file', 'Choose file')
    if (heldCount > 0) return t('blocks:Form.FormFileUploadField.action.add_files', 'Add files')
    return t('blocks:Form.FormFileUploadField.action.choose_files', 'Choose files')
  }

  const dropZoneProps = {
    accept: extensions,
    multiple,
    isDisabled: isInputDisabled,
    isInvalid,
    rejectDescription: fileTypes
      ? t('blocks:Form.FormFileUploadField.label.use_file_types', 'Use a {{fileTypes}}', { fileTypes })
      : undefined,
    onDrop: onSelect,
  }

  const emptyDropZone = (isEmbedded: boolean) => (
    <DropZone {...dropZoneProps} isEmbedded={isEmbedded} title={getTitle()} description={getDescription()} actionLabel={getActionLabel()} />
  )

  const fileRows = (isGrouped: boolean) => (
    <>
      {files.map(({ id, name, sizeInBytes, addedAt, href }) => (
        <FileRow
          key={id}
          name={name}
          sizeInBytes={sizeInBytes}
          addedAt={addedAt}
          href={isReadOnly ? href : undefined}
          isGrouped={isGrouped}
          isDisabled={isInputDisabled}
          onRemove={isReadOnly ? undefined : () => removeFile(id)}
        />
      ))}
      {pending.map(({ key, file, status }) => (
        <FileRow
          key={key}
          name={file.name}
          sizeInBytes={file.size}
          status={status}
          isGrouped={isGrouped}
          isDisabled={isDisabled}
          onRetry={() => void uploadPending(pending.filter(item => item.key === key))}
          onRemove={() => removePending(key)}
        />
      ))}
    </>
  )

  const renderControl = () => {
    if (isReadOnly) {
      return files.length === 0
        ? <Span variant='subtle'>{t('blocks:Form.FormFileUploadField.label.no_files', 'No files uploaded')}</Span>
        : <VStack className='Layer__FormFileUploadField__List'>{fileRows(true)}</VStack>
    }

    if (!multiple) {
      const [file] = files
      if (pending.length > 0) return fileRows(false)
      if (!file) return emptyDropZone(false)

      return (
        <DropZone {...dropZoneProps} title={getTitle()}>
          {({ open }) => (
            <FileRow
              name={file.name}
              sizeInBytes={file.sizeInBytes}
              addedAt={file.addedAt}
              isGrouped
              isDisabled={isInputDisabled}
              onReplace={open}
              onRemove={() => removeFile(file.id)}
            />
          )}
        </DropZone>
      )
    }

    if (heldCount === 0) return emptyDropZone(false)

    return (
      <VStack className='Layer__FormFileUploadField__List' {...toDataProperties({ invalid: isInvalid })}>
        {fileRows(true)}
        {isAtLimit && fileLimit !== undefined
          ? (
            <Span size='sm' variant='subtle' className='Layer__FormFileUploadField__LimitNotice'>
              {t('blocks:Form.FormFileUploadField.label.at_limit', '{{count}} of {{limit}} files added. Remove one to add another.', {
                count: heldCount,
                limit: formatNumber(fileLimit),
              })}
            </Span>
          )
          : emptyDropZone(true)}
      </VStack>
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
