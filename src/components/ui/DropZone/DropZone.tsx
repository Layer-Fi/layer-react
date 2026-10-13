import { type MouseEvent, type ReactNode } from 'react'
import { AlertCircle, CloudUpload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'

import { toDropzoneAccept } from '@utils/shared/file/fileName'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './dropZone.scss'

export type DropZoneSize = 'md' | 'lg'

export type DropZoneDragState = 'accept' | 'reject' | undefined

type DropZoneRenderProps = { open: () => void, dragState: DropZoneDragState }

export type DropZoneProps = {
  title: string
  description?: string
  /** File extensions without the dot, used only to flag a wrong type while it is dragged. */
  accept?: ReadonlyArray<string>
  multiple?: boolean
  size?: DropZoneSize
  isDisabled?: boolean
  isInvalid?: boolean
  /** Without one, the whole zone is the tap target — the touch layout. */
  actionLabel?: string
  rejectDescription?: string
  /** Receives every dropped or chosen file; validating count, type and size is left to the caller. */
  onDrop: (files: File[]) => void
  /** Sits inside a shared list container instead of standing alone. */
  isEmbedded?: boolean
  slots?: { Actions?: ReactNode, Footer?: ReactNode }
  /** Replaces the default body while keeping the zone a drop target, e.g. a file row that accepts a replacement. */
  children?: (renderProps: DropZoneRenderProps) => ReactNode
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
  slots,
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

  const dragState: DropZoneDragState = isDragActive && !isDisabled ? (isDragReject ? 'reject' : 'accept') : undefined

  const openIfEnabled = () => {
    if (!isDisabled) open()
  }

  const heading = dragState === 'accept'
    ? t('ui:DropZone.label.drop_to_upload', 'Drop to upload')
    : dragState === 'reject'
      ? t('ui:DropZone.error.unsupported_file_type', 'This file type isn’t supported')
      : title

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
        ? children({ open: openIfEnabled, dragState })
        : (
          <Layout className='Layer__UI__DropZone__Body' {...dataProperties} align='center' gap='sm'>
            <HStack className='Layer__UI__DropZone__Icon' {...dataProperties} align='center' justify='center'>
              {dragState === 'reject' ? <AlertCircle size={16} /> : <CloudUpload size={size === 'lg' ? 20 : 16} />}
            </HStack>
            <VStack className='Layer__UI__DropZone__Text' {...dataProperties} gap='4xs'>
              <Span weight={dragState || size === 'lg' ? 'bold' : undefined} status={textStatus}>{heading}</Span>
              {detail && <Span size='sm' variant={textStatus ? undefined : 'subtle'} status={textStatus}>{detail}</Span>}
            </VStack>
            {!dragState && (actionLabel || slots?.Actions) && (
              <HStack gap='xs' align='center' className='Layer__UI__DropZone__Actions'>
                {actionLabel && (
                  <Button variant='outlined' isDisabled={isDisabled} onPress={openIfEnabled}>
                    {actionLabel}
                  </Button>
                )}
                {slots?.Actions}
              </HStack>
            )}
          </Layout>
        )}
      {slots?.Footer && <HStack className='Layer__UI__DropZone__Footer'>{slots.Footer}</HStack>}
    </VStack>
  )
}
