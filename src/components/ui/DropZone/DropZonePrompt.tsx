import { type KeyboardEvent } from 'react'
import { CloudUpload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Button } from '@ui/Button/Button'
import { HStack, type StackProps, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

export type DropZonePromptProps = {
  title: string
  description?: string
  /** Without one, the whole prompt is the tap target. */
  actionLabel?: string
}

export type DropZoneSize = 'md' | 'lg'

type PromptProps = DropZonePromptProps & {
  size: DropZoneSize
  isDragging: boolean
  isDisabled: boolean
  onOpen: () => void
}

const getTapTargetProps = (title: string, isDisabled: boolean, onOpen: () => void) => ({
  'role': 'button' as const,
  'tabIndex': isDisabled ? undefined : 0,
  'aria-label': title,
  'aria-disabled': isDisabled || undefined,
  'onClick': onOpen,
  'onKeyDown': (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen()
  },
})

export const DropZonePrompt = ({ title, description, actionLabel, size, isDragging, isDisabled, onOpen }: PromptProps) => {
  const { t } = useTranslation()
  const isPressable = actionLabel === undefined
  const isLarge = size === 'lg'
  const Layout = isLarge ? VStack : HStack
  const padding: Pick<StackProps, 'pi' | 'pb'> = isPressable
    ? { pi: 'md', pb: 'sm' }
    : isLarge ? { pi: 'lg', pb: 'xl' } : { pi: 'md', pb: 'md' }
  const textStatus = isDisabled ? 'disabled' : undefined
  const textAlign = isLarge ? 'center' : undefined

  return (
    <Layout
      className='Layer__UI__DropZone__Prompt'
      {...toDataProperties({ pressable: isPressable, disabled: isDisabled })}
      {...padding}
      {...(isPressable && getTapTargetProps(title, isDisabled, onOpen))}
      align='center'
      gap='sm'
    >
      <HStack className='Layer__UI__DropZone__Icon' {...toDataProperties({ size, dragging: isDragging, disabled: isDisabled })} align='center' justify='center'>
        <CloudUpload size={isLarge ? 20 : 16} />
      </HStack>
      <VStack fluid align={textAlign} gap='4xs'>
        <Span weight={isDragging || isLarge ? 'bold' : undefined} status={textStatus} align={textAlign}>
          {isDragging ? t('ui:DropZone.DropZonePrompt.label.drop_to_upload', 'Drop to upload') : title}
        </Span>
        {description && <Span size='sm' variant={textStatus ? undefined : 'subtle'} status={textStatus} align={textAlign}>{description}</Span>}
      </VStack>
      {!isDragging && actionLabel && (
        <Button variant='outlined' isDisabled={isDisabled} onPress={onOpen}>
          {actionLabel}
        </Button>
      )}
    </Layout>
  )
}
