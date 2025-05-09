import { useContext } from 'react'
import { BadgeLoader } from '../../BadgeLoader'
import { HStack, Spacer, VStack } from '../../ui/Stack/Stack'
import { Text, TextSize } from '../../Typography'
import { QuickbooksContext } from '../../../contexts/QuickbooksContext/QuickbooksContext'
import { format, isValid } from 'date-fns'

const formatLastSyncedAt = (datetime: string) => {
  const parsed = new Date(datetime)
  if (!isValid(parsed)) return ''

  return `${format(parsed, 'MMMM d, yyyy')} at ${format(parsed, 'h:mm a')}`
}

export const IntegrationsQuickbooksItemThumbFooter = () => {
  const {
    isSyncingFromQuickbooks,
    quickbooksLastSyncedAt,
  } = useContext(QuickbooksContext)

  if (isSyncingFromQuickbooks) {
    return (
      <HStack className='loadingbar'>
        <VStack>
          <Text size={TextSize.sm}>Syncing account data</Text>
          <Text size={TextSize.sm} className='syncing-data-description'>
            This may take up to 5 minutes
          </Text>
        </VStack>
        <Spacer />
        <BadgeLoader variant='info' />
      </HStack>
    )
  }

  if (quickbooksLastSyncedAt) {
    return (
      <HStack className='loadingbar'>
        <VStack>
          <Text size={TextSize.sm}>Last synced on</Text>
          <Text size={TextSize.sm} className='syncing-data-description'>
            {formatLastSyncedAt(quickbooksLastSyncedAt)}
          </Text>
        </VStack>
        <Spacer />
        <BadgeLoader variant='success' />
      </HStack>
    )
  }

  return (
    <HStack className='loadingbar'>
      <VStack>
        <Text size={TextSize.sm}>New account</Text>
        <Text size={TextSize.sm} className='syncing-data-description'>
          Please sync your account
        </Text>
      </VStack>
      <Spacer />
      <BadgeLoader variant='warning' />
    </HStack>
  )
}
