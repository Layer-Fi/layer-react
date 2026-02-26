import { type ChangeEvent, useRef } from 'react'

import UploadCloud from '@icons/UploadCloud'
import { ButtonVariant } from '@components/Button/Button'
import { Button } from '@components/Button/Button'
import { TextButton } from '@components/Button/TextButton'

interface FileInputBaseProps {
  text?: string
  disabled?: boolean
  secondary?: boolean
  iconOnly?: boolean
  icon?: React.ReactNode
  accept?: string
}

interface FileInputSingleProps extends FileInputBaseProps {
  allowMultipleUploads?: false
  onUpload?: (file: File) => void
}

interface FileInputMultipleProps extends FileInputBaseProps {
  allowMultipleUploads: true
  onUpload?: (files: File[]) => void
}

export type FileInputProps = FileInputSingleProps | FileInputMultipleProps

export const FileInput = (props: FileInputProps) => {
  const {
    text = 'Upload',
    disabled = false,
    secondary,
    iconOnly = false,
    icon,
    allowMultipleUploads = false,
    accept,
  } = props

  const hiddenFileInput = useRef<HTMLInputElement>(null)

  const onClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click()
    }
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesUploaded = Array.from(event.target.files)
      if (props.allowMultipleUploads) {
        props.onUpload?.(filesUploaded)
      }
      else {
        const firstFile = filesUploaded[0]
        if (firstFile) {
          props.onUpload?.(firstFile)
        }
      }
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
        accept={accept}
        multiple={allowMultipleUploads}
        onChange={onChange}
        ref={hiddenFileInput}
        style={{ display: 'none' }}
      />
    </>
  )
}
