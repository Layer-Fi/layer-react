import { type MouseEvent, type ReactNode } from 'react'
import { AlertCircle, CloudUpload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './dropZone.scss'

type DragState = 'accept' | 'reject' | undefined

export type DropZoneProps = {
  title: string
  description?: string
  /** File extensions without the dot, used only to flag a wrong type while it is dragged. */
  accept?: ReadonlyArray<string>
  multiple?: boolean
  size?: 'md' | 'lg'
  isDisabled?: boolean
  isInvalid?: boolean
  actionLabel?: string
  rejectDescription?: string
  /** Receives every dropped or chosen file; validating count, type and size is left to the caller. */
  onDrop: (files: File[]) => void
  isEmbedded?: boolean
  children?: (renderProps: { open: () => void }) => ReactNode
}

const MIME_TYPES_BY_EXTENSION: Record<string, ReadonlyArray<string>> = {
  pdf: ['application/pdf'],
  png: ['image/png'],
  jpg: ['image/jpeg'],
  csv: ['text/csv', 'application/vnd.ms-excel'],
  txt: ['text/plain'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

// Undefined when any extension has no known MIME type, so an unfamiliar type is never flagged as rejected mid-drag.
const toDropzoneAccept = (extensions: ReadonlyArray<string>) => {
  if (extensions.length === 0) return undefined

  const accept: Record<string, string[]> = {}
  for (const extension of extensions) {
    const mimeTypes = MIME_TYPES_BY_EXTENSION[extension]
    if (!mimeTypes) return undefined

    for (const mimeType of mimeTypes) {
      accept[mimeType] = [...(accept[mimeType] ?? []), `.${extension}`]
    }
  }
  return accept
}

const isFromButton = (event: MouseEvent<HTMLElement>) => event.target instanceof Element && event.target.closest('button') !== null

export const DropZone = ({
  title,
  description,
  accept = [],
  multiple = false,
  size = 'md',
  isDisabled = false,
  isInvalid = false,
  actionLabel,
  rejectDescription,
  onDrop,
  isEmbedded = false,
  children,
}: DropZoneProps) => {
  const { t } = useTranslation()
  const isPressable = actionLabel === undefined && children === undefined

  // Keeps its drop handlers while disabled so the browser doesn't open a dropped file in the tab.
  const { getRootProps, getInputProps, open, isDragActive, isDragReject } = useDropzone({
    accept: toDropzoneAccept(accept),
    onDrop: (accepted, rejected) => {
      if (!isDisabled) onDrop([...accepted, ...rejected.map(({ file }) => file)])
    },
    noClick: true,
    noKeyboard: !isPressable,
  })

  const dragState: DragState = isDragActive && !isDisabled ? (isDragReject ? 'reject' : 'accept') : undefined

  const openIfEnabled = () => {
    if (!isDisabled) open()
  }

  const getHeading = () => {
    switch (dragState) {
      case 'accept':
        return t('ui:DropZone.label.drop_to_upload', 'Drop to upload')
      case 'reject':
        return t('ui:DropZone.error.unsupported_file_type', 'This file type isn’t supported')
      case undefined:
        return title
    }
  }

  const detail = dragState === 'reject' ? rejectDescription : description

  const rootProps = getRootProps({
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (!children && !isFromButton(event)) openIfEnabled()
    },
    ...(isPressable && { 'role': 'button', 'aria-label': title, 'aria-disabled': isDisabled || undefined }),
  })

  const Layout = size === 'lg' ? VStack : HStack
  const dataProperties = toDataProperties({
    size,
    drag: dragState,
    invalid: isInvalid,
    disabled: isDisabled,
    pressable: isPressable,
    embedded: isEmbedded,
    custom: children !== undefined,
  })
  const textStatus = dragState === 'reject' ? 'error' : isDisabled ? 'disabled' : undefined

  return (
    <VStack className='Layer__UI__DropZone' {...dataProperties} {...rootProps}>
      <input {...getInputProps()} multiple={multiple} disabled={isDisabled} />
      {children
        ? children({ open: openIfEnabled })
        : (
          <Layout className='Layer__UI__DropZone__Body' {...dataProperties} align='center' gap='sm'>
            <HStack className='Layer__UI__DropZone__Icon' {...dataProperties} align='center' justify='center'>
              {dragState === 'reject' ? <AlertCircle size={16} /> : <CloudUpload size={size === 'lg' ? 20 : 16} />}
            </HStack>
            <VStack className='Layer__UI__DropZone__Text' {...dataProperties} gap='4xs'>
              <Span weight={dragState || size === 'lg' ? 'bold' : undefined} status={textStatus}>{getHeading()}</Span>
              {detail && <Span size='sm' variant={textStatus ? undefined : 'subtle'} status={textStatus}>{detail}</Span>}
            </VStack>
            {!dragState && actionLabel && (
              <Button variant='outlined' isDisabled={isDisabled} onPress={openIfEnabled}>
                {actionLabel}
              </Button>
            )}
          </Layout>
        )}
    </VStack>
  )
}
