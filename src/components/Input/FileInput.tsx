import { type ChangeEvent, useRef } from 'react'
import { CloudUpload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'

export interface FileInputProps {
  text?: string
  onUpload?: (files: File[]) => void
  disabled?: boolean
  secondary?: boolean
  iconOnly?: boolean
  icon?: React.ReactNode
  allowMultipleUploads?: boolean
  accept?: string
}

export const FileInput = ({
  text,
  onUpload,
  disabled = false,
  secondary,
  iconOnly = false,
  icon,
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
    if (event.target.files && event.target.files.length > 0 && onUpload) {
      const filesUploaded = Array.from(event.target.files)
      onUpload(filesUploaded)
    }
    event.target.value = ''
  }

  if (secondary) {
    return (
      <>
        <Button variant='text' underline onPress={onClick} isDisabled={disabled}>
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
        isDisabled={disabled}
        icon={iconOnly}
        aria-label={iconOnly ? buttonText : undefined}
      >
        {!iconOnly && buttonText}
        {icon ?? <CloudUpload size={18} />}
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
