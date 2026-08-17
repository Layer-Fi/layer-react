import { type ChangeEvent, type ReactNode, useRef } from 'react'
import { CloudUpload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'

export interface FileInputProps {
  text?: string
  // Non-empty, so consumers that only want the first file don't have to re-check for one.
  onUpload?: (files: [File, ...File[]]) => void
  isDisabled?: boolean
  secondary?: boolean
  icon?: boolean
  slots?: { Icon?: ReactNode }
  allowMultipleUploads?: boolean
  accept?: string
}

export const FileInput = ({
  text,
  onUpload,
  isDisabled = false,
  secondary,
  icon = false,
  slots,
  allowMultipleUploads = false,
  accept,
}: FileInputProps) => {
  const { t } = useTranslation()
  const buttonText = text ?? t('common:action.upload_label', 'Upload')
  const hiddenFileInput = useRef<HTMLInputElement>(null)

  const onClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click()
    }
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [firstFile, ...restFiles] = Array.from(event.target.files ?? [])

    if (firstFile && onUpload) {
      onUpload([firstFile, ...restFiles])
    }
    event.target.value = ''
  }

  if (secondary) {
    return (
      <>
        <Button variant='text' underline onPress={onClick} isDisabled={isDisabled}>
          {buttonText}
        </Button>
        <input
          type='file'
          accept={accept}
          multiple={allowMultipleUploads}
          onChange={onChange}
          ref={hiddenFileInput}
          style={{ display: 'none' }}
        />
      </>
    )
  }

  return (
    <>
      <Button
        onPress={onClick}
        variant='outlined'
        isDisabled={isDisabled}
        icon={icon}
        aria-label={icon ? buttonText : undefined}
      >
        {!icon && buttonText}
        {slots?.Icon ?? <CloudUpload size={18} />}
      </Button>
      <input
        type='file'
        accept={accept}
        multiple={allowMultipleUploads}
        onChange={onChange}
        ref={hiddenFileInput}
        style={{ display: 'none' }}
      />
    </>
  )
}
