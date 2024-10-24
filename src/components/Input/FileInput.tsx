import React, { useRef, ChangeEvent } from 'react'
import UploadCloud from '../../icons/UploadCloud'
import { Button, TextButton } from '../Button'
import { ButtonVariant } from '../Button/Button'

export interface FileInputProps {
  text?: string
  onUpload?: (file: File) => void
  disabled?: boolean
  secondary?: boolean
  iconOnly?: boolean
}

export const FileInput = ({
  text = 'Upload',
  onUpload,
  disabled = false,
  secondary,
  iconOnly = false,
}: FileInputProps) => {
  const hiddenFileInput = useRef<HTMLInputElement>(null)

  const onClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click()
    }
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0 && onUpload) {
      const fileUploaded = event.target.files[0]
      onUpload(fileUploaded)
    }
  }

  if (secondary) {
    return (
      <>
        <TextButton onClick={onClick} disabled={disabled}>
          {text}
        </TextButton>
        <input
          type='file'
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
        rightIcon={<UploadCloud />}
        disabled={disabled}
        iconOnly={iconOnly}
      >
        {!iconOnly && text}
      </Button>
      <input
        type='file'
        onChange={onChange}
        ref={hiddenFileInput}
        style={{ display: 'none' }}
      />
    </>
  )
}
