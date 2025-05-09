import React from 'react'
import { useContext, useMemo } from 'react'
import QuickbooksIcon from '../../../icons/QuickbooksIcon'
import { Badge, BadgeVariant } from '../../Badge'
import { BadgeLoader } from '../../BadgeLoader'
import RefreshCcw from '../../../icons/RefreshCcw'
import { BadgeSize } from '../../Badge/Badge'
import { DateTime } from '../../DateTime'
import { HStack, Spacer, VStack } from '../../ui/Stack/Stack'
import { Card } from '../../Card/Card'
import { Text, TextSize } from '../../Typography'
import { QuickbooksContext } from '../../../contexts/QuickbooksContext/QuickbooksContext'
import CheckIcon from '../../../icons/Check'
import { format } from 'date-fns'

const formatLastSyncedAt = (datetime: string) => `${format(datetime, 'MMMM d, yyyy')}\nat\n${format(datetime, 'h:mm a')}`;

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
      <BadgeLoader variant='warning'/>
    </HStack>
  ) 
}
