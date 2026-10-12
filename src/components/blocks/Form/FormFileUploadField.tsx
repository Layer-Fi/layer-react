import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/shared/i18n/plural'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { FileInput } from '@ui/Input/FileInput'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { formFieldLayoutProps, FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import './formFileUploadField.scss'

import { useFieldContext } from './formContexts'

export type UploadedFile = { id: string, name: string }

export type FormFileUploadFieldProps = Omit<CommonFormFieldProps, 'errorText'> & {
  /** File extensions without the dot; empty accepts any file. */
  accept: ReadonlyArray<string>
  multiple?: boolean
  /** The most files one upload may carry; only applies with `multiple`. A larger selection is rejected before uploading. */
  maxFiles?: number
  /** Resolves with the files the server stored, or null when the upload failed. */
  upload: (files: ReadonlyArray<File>) => Promise<ReadonlyArray<UploadedFile> | null>
}

const getExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() ?? ''

export function FormFileUploadField({ accept, multiple = false, maxFiles, upload, ...props }: FormFileUploadFieldProps) {
  const { t } = useTranslation()
  const { formatList, formatNumber } = useIntlFormatter()
  const field = useFieldContext<UploadedFile[]>()
  const [error, setError] = useState<string | undefined>(undefined)
  const [isUploading, setIsUploading] = useState(false)
  const { isMobile } = useSizeClass()

  const { labelId, shellProps } = useFormField({ ...props, errorText: error })
  const { className, inline, align, showLabel, isDisabled } = props

  const files = field.state.value
  const extensions = accept.map(extension => extension.toLowerCase())
  const isAccepted = (name: string) => extensions.length === 0 || extensions.includes(getExtension(name))
  const fileLimit = multiple ? maxFiles : 1
  const isInputDisabled = isDisabled || isUploading

  const onUpload = async (selected: ReadonlyArray<File>) => {
    const rejected = selected.filter(({ name }) => !isAccepted(name))
    const accepted = selected.filter(file => !rejected.includes(file))
    const isOverLimit = fileLimit !== undefined && accepted.length > fileLimit
    const toUpload = isOverLimit ? [] : accepted

    setIsUploading(true)
    const uploaded = toUpload.length > 0 ? await upload(toUpload).catch(() => null) : []
    setIsUploading(false)

    const errors = [
      rejected.length > 0
        ? t(
          'blocks:Form.FormFileUploadField.error.files_not_added',
          'Some files couldn’t be added. Upload a {{fileTypes}} file instead.',
          { fileTypes: formatList(extensions.map(extension => extension.toUpperCase()), { type: 'disjunction' }) },
        )
        : null,
      isOverLimit
        ? tPlural(t, 'blocks:Form.FormFileUploadField.error.too_many_files', {
          count: fileLimit,
          displayCount: formatNumber(fileLimit),
          one: 'Upload {{displayCount}} file at a time.',
          other: 'Upload up to {{displayCount}} files at a time.',
        })
        : null,
      uploaded === null ? t('blocks:Form.FormFileUploadField.error.upload_failed', 'Some files couldn’t be uploaded. Try again.') : null,
    ].filter(message => message !== null)

    setError(errors.length > 0 ? errors.join(' ') : undefined)

    if (!uploaded || uploaded.length === 0) return

    field.handleChange([...(multiple ? files : []), ...uploaded])
  }

  const { getRootProps, isDragActive } = useDropzone({
    onDrop: (dropped) => {
      if (!isInputDisabled) void onUpload(dropped)
    },
    noClick: true,
    noKeyboard: true,
  })

  const getUploadLabel = () => {
    if (files.length === 0) return t('blocks:Form.FormFileUploadField.action.upload_files', 'Upload files')
    if (multiple) return t('blocks:Form.FormFileUploadField.action.add_more_files', 'Add more files')
    return t('blocks:Form.FormFileUploadField.action.replace_file', 'Replace file')
  }

  const fileInput = (
    <FileInput
      text={getUploadLabel()}
      accept={extensions.map(extension => `.${extension}`).join(',')}
      allowMultipleUploads={multiple}
      isDisabled={isInputDisabled}
      onUpload={selected => void onUpload(selected)}
    />
  )

  return (
    <div {...formFieldLayoutProps({ className, inline, align, showLabel })}>
      <FormFieldShell {...shellProps} labelId={labelId}>
        <VStack gap='xs'>
          {files.map(({ id, name }) => (
            <HStack key={id} gap='sm' align='center' justify='space-between' className='Layer__FormFileUploadField__File'>
              <Span size='sm' ellipsis noWrap>{name}</Span>
              <Button
                variant='text'
                isDisabled={isInputDisabled}
                onPress={() => field.handleChange(files.filter(file => file.id !== id))}
              >
                {t('blocks:Form.FormFileUploadField.action.remove_file', 'Remove')}
              </Button>
            </HStack>
          ))}
          {isMobile
            ? <HStack>{fileInput}</HStack>
            : (
              <HStack
                gap='sm'
                align='center'
                className='Layer__FormFileUploadField__DropZone'
                {...toDataProperties({ 'drag-active': isDragActive && !isInputDisabled, 'disabled': isInputDisabled })}
                {...getRootProps()}
              >
                {fileInput}
                <Span size='sm' variant='subtle'>
                  {multiple
                    ? t('blocks:Form.FormFileUploadField.label.drop_files', 'or drag and drop files here')
                    : t('blocks:Form.FormFileUploadField.label.drop_file', 'or drag and drop a file here')}
                </Span>
              </HStack>
            )}
        </VStack>
      </FormFieldShell>
    </div>
  )
}
