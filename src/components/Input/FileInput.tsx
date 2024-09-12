import React, { useRef, ChangeEvent } from 'react'
import UploadCloud from '../../icons/UploadCloud'
import { Button } from '../Button'
import { ButtonVariant } from '../Button/Button'

export interface FileInputProps {
  text?: string
  onUpload?: (file: File) => void
  disabled?: boolean
}

export const FileInput = ({ text = 'Upload', onUpload, disabled = false }: FileInputProps) => {
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

  return (
    <>
      <Button
        onClick={onClick}
        variant={ButtonVariant.secondary}
        rightIcon={<UploadCloud />}
        disabled={disabled}
      >
        {text}
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
