import { type ChangeEvent, useRef } from 'react'

import UploadCloud from '@icons/UploadCloud'
import { ButtonVariant } from '@components/Button/Button'
import { Button } from '@components/Button/Button'
import { TextButton } from '@components/Button/TextButton'

export interface FileInputProps {
  text?: string
  onUpload?: (files: File[]) => void
  disabled?: boolean
  secondary?: boolean
  iconOnly?: boolean
  icon?: React.ReactNode
  allowMultipleUploads?: boolean
}

export const FileInput = ({
  text = 'Upload',
  onUpload,
  disabled = false,
  secondary,
  iconOnly = false,
  icon,
  allowMultipleUploads = false,
}: FileInputProps) => {
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
        <TextButton onClick={onClick} disabled={disabled}>
          {text}
        </TextButton>
        <input
          type='file'
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
        onClick={onClick}
        variant={ButtonVariant.secondary}
        rightIcon={icon ?? <UploadCloud />}
        disabled={disabled}
        iconOnly={iconOnly}
      >
        {!iconOnly && text}
      </Button>
      <input
        type='file'
        multiple={allowMultipleUploads}
        onChange={onChange}
        ref={hiddenFileInput}
        style={{ display: 'none' }}
      />
    </>
  )
}
