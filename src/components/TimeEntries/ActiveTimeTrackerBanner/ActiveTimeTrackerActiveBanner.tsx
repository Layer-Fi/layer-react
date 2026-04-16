import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TimeEntryServiceSelector } from '@components/TimeEntries/TimeEntryServiceSelector/TimeEntryServiceSelector'

type ActiveTimeTrackerActiveBannerProps = {
  actionError: string | null
  timerDisplayValue: string
  selectedServiceId: string | null
  onSelectedServiceIdChange: (serviceId: string | null) => void
  selectedCustomer: Customer | null
  onSelectedCustomerChange: (customer: Customer | null) => void
  onCancelTimer: () => void
  onCompleteTimer: () => void
  isCancelling: boolean
  isStopping: boolean
  isUpdating: boolean
}

export const ActiveTimeTrackerActiveBanner = ({
  actionError,
  timerDisplayValue,
  selectedServiceId,
  onSelectedServiceIdChange,
  selectedCustomer,
  onSelectedCustomerChange,
  onCancelTimer,
  onCompleteTimer,
  isCancelling,
  isStopping,
  isUpdating,
}: ActiveTimeTrackerActiveBannerProps) => {
  const { t } = useTranslation()

  return (
    <Container name='ActiveTimeTrackerBanner'>
      {actionError && (
        <VStack pi='md' pbe='2xs'>
          <DataState
            status={DataStateStatus.failed}
            title={actionError}
            inline
          />
        </VStack>
      )}

      <HStack className='Layer__ActiveTimeTrackerBanner__Main' gap='md' justify='space-between' align='center'>
        <HStack className='Layer__ActiveTimeTrackerBanner__Controls' gap='sm' align='center'>
          <HStack className='Layer__ActiveTimeTrackerBanner__Timer' gap='sm' align='center'>
            <Span className='Layer__ActiveTimeTrackerBanner__TimerDot' />
            <Span className='Layer__ActiveTimeTrackerBanner__TimerValue'>{timerDisplayValue}</Span>
          </HStack>

          <HStack className='Layer__ActiveTimeTrackerBanner__InlineFields' gap='sm' align='center'>
            <TimeEntryServiceSelector
              selectedServiceId={selectedServiceId}
              onSelectedServiceIdChange={onSelectedServiceIdChange}
              inline
              showLabel={false}
              className='Layer__ActiveTimeTrackerBanner__Field__Service Layer__ActiveTimeTrackerBanner__Field--inline'
            />

            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onSelectedCustomerChange={onSelectedCustomerChange}
              inline
              showLabel={false}
              placeholder={t('timeTracking:label.select_customer', 'Select a customer (optional)')}
              className='Layer__ActiveTimeTrackerBanner__Field__Customer Layer__ActiveTimeTrackerBanner__Field--inline'
            />
          </HStack>
        </HStack>

        <HStack className='Layer__ActiveTimeTrackerBanner__Actions' gap='sm' align='center'>
          <Button
            variant='text'
            onPress={onCancelTimer}
            isPending={isCancelling}
            isDisabled={isStopping || isUpdating}
          >
            {t('timeTracking:action.cancel_timer', 'Cancel')}
          </Button>

          <HStack className='Layer__ActiveTimeTrackerBanner__CompleteButton'>
            <Button
              variant='outlined'
              onPress={onCompleteTimer}
              isPending={isStopping || isUpdating}
              isDisabled={isCancelling || !selectedServiceId}
            >
              {t('timeTracking:action.complete_timer', 'Complete')}
              <Check size={16} />
            </Button>
          </HStack>
        </HStack>
      </HStack>
    </Container>
  )
}
