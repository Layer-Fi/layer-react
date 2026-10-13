import { type MouseEvent, type ReactNode } from 'react'
import { CloudUpload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Button } from '@ui/Button/Button'
import { HStack, type StackProps, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './dropZone.scss'

export type DropZoneProps = {
  title: string
  description?: string
  /** File extensions without the dot, offered as the file picker's filter. */
  accept?: ReadonlyArray<string>
  multiple?: boolean
  size?: 'md' | 'lg'
  isDisabled?: boolean
  isInvalid?: boolean
  actionLabel?: string
  /** Receives every dropped or chosen file; validating count, type and size is left to the caller. */
  onDrop: (files: File[]) => void
  isEmbedded?: boolean
  children?: (renderProps: { open: () => void }) => ReactNode
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
  onDrop,
  isEmbedded = false,
  children,
}: DropZoneProps) => {
  const { t } = useTranslation()
  const isPressable = actionLabel === undefined && children === undefined

  // Keeps its drop handlers while disabled so the browser doesn't open a dropped file in the tab.
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (!isDisabled) onDrop(files)
    },
    noClick: true,
    noKeyboard: !isPressable || isDisabled,
  })

  const isDragging = isDragActive && !isDisabled

  const openIfEnabled = () => {
    if (!isDisabled) open()
  }

  const rootProps = getRootProps({
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (!children && !isFromButton(event)) openIfEnabled()
    },
    ...(isPressable && { 'role': 'button', 'aria-label': title, 'aria-disabled': isDisabled || undefined }),
  })

  const isLarge = size === 'lg'
  const Layout = isLarge ? VStack : HStack
  const bodyPadding: Pick<StackProps, 'pi' | 'pb'> = isPressable
    ? { pi: 'sm', pb: 'sm' }
    : isLarge ? { pi: 'lg', pb: 'xl' } : { pi: 'md', pb: 'md' }
  const dataProperties = toDataProperties({
    size,
    dragging: isDragging,
    invalid: isInvalid,
    disabled: isDisabled,
    pressable: isPressable,
    embedded: isEmbedded,
    custom: children !== undefined,
  })
  const textStatus = isDisabled ? 'disabled' : undefined

  return (
    <VStack className='Layer__UI__DropZone' {...dataProperties} {...rootProps}>
      <input {...getInputProps()} accept={accept.map(extension => `.${extension}`).join(',')} multiple={multiple} disabled={isDisabled} />
      {children
        ? children({ open: openIfEnabled })
        : (
          <Layout className='Layer__UI__DropZone__Body' {...dataProperties} {...bodyPadding} align='center' gap='sm'>
            <HStack className='Layer__UI__DropZone__Icon' {...dataProperties} align='center' justify='center'>
              <CloudUpload size={isLarge ? 20 : 16} />
            </HStack>
            <VStack className='Layer__UI__DropZone__Text' fluid align={isLarge ? 'center' : undefined} gap='4xs'>
              <Span weight={isDragging || isLarge ? 'bold' : undefined} status={textStatus} align={isLarge ? 'center' : undefined}>
                {isDragging ? t('ui:DropZone.label.drop_to_upload', 'Drop to upload') : title}
              </Span>
              {description && <Span size='sm' variant={textStatus ? undefined : 'subtle'} status={textStatus} align={isLarge ? 'center' : undefined}>{description}</Span>}
            </VStack>
            {!isDragging && actionLabel && (
              <Button variant='outlined' isDisabled={isDisabled} onPress={openIfEnabled}>
                {actionLabel}
              </Button>
            )}
          </Layout>
        )}
    </VStack>
  )
}
