import { AlertTriangle, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type TimeEntry } from '@schemas/timeTracking'
import { useActiveTimerBannerForm } from '@hooks/features/timeTracking/useActiveTimerBannerForm'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { TimeEntryServiceSelector } from '@components/TimeEntries/TimeEntryServiceSelector/TimeEntryServiceSelector'

type ActiveTimeTrackerBannerProps = {
  activeEntry: TimeEntry
  timerDisplayValue: string
}

export const ActiveTimeTrackerBanner = ({ activeEntry, timerDisplayValue }: ActiveTimeTrackerBannerProps) => {
  const { t } = useTranslation()
  const { form, actions, state } = useActiveTimerBannerForm({ activeEntry })

  return (
    <Container name='ActiveTimeTracker' className='Layer__ActiveTimeTracker__Container'>
      {state.actionError && (
        <HStack className='Layer__ActiveTimeTracker__ErrorStrip' pb='xs' pi='md' role='alert'>
          <HStack className='Layer__ActiveTimeTracker__ErrorStripRow' gap='sm' align='center'>
            <AlertTriangle
              aria-hidden
              className='Layer__ActiveTimeTracker__ErrorStripIcon'
              size={16}
              strokeWidth={1.25}
            />
            <Span size='sm' className='Layer__ActiveTimeTracker__ErrorStripText'>{state.actionError}</Span>
          </HStack>
        </HStack>
      )}

      <HStack className='Layer__ActiveTimeTracker__Main' gap='md' justify='space-between' align='center'>
        <HStack className='Layer__ActiveTimeTracker__Controls' gap='sm' align='center'>
          <HStack className='Layer__ActiveTimeTracker__Timer' gap='sm' align='center'>
            <Span className='Layer__ActiveTimeTracker__TimerDot' />
            <Span className='Layer__ActiveTimeTracker__TimerValue'>{timerDisplayValue}</Span>
          </HStack>

          <HStack className='Layer__ActiveTimeTracker__InlineFields' gap='sm' align='center'>
            <form.Field name='selectedServiceId'>
              {field => (
                <TimeEntryServiceSelector
                  selectedServiceId={field.state.value}
                  onSelectedServiceIdChange={field.handleChange}
                  inline
                  isClearable={false}
                  showLabel={false}
                  className='Layer__ActiveTimeTracker__Field__Service Layer__ActiveTimeTracker__Field--inline'
                />
              )}
            </form.Field>

            <form.Field name='selectedCustomer'>
              {field => (
                <CustomerSelector
                  selectedCustomer={field.state.value}
                  onSelectedCustomerChange={field.handleChange}
                  inline
                  showLabel={false}
                  placeholder={t('timeTracking:label.select_customer', 'Select a customer (optional)')}
                  className='Layer__ActiveTimeTracker__Field__Customer Layer__ActiveTimeTracker__Field--inline'
                />
              )}
            </form.Field>
          </HStack>
        </HStack>

        <HStack className='Layer__ActiveTimeTracker__Actions' gap='sm' align='center'>
          <Button
            variant='text'
            onPress={actions.cancelTimer}
            isPending={state.isCancelling}
            isDisabled={state.isStopping || state.isUpdating}
          >
            {t('timeTracking:action.cancel_timer', 'Cancel')}
          </Button>

          <form.Subscribe selector={s => s.values.selectedServiceId}>
            {selectedServiceId => (
              <Button
                variant='outlined-light'
                onPress={actions.completeTimer}
                isDisabled={state.isCancelling || state.isStopping || state.isUpdating || !selectedServiceId}
              >
                {t('timeTracking:action.complete_timer', 'Complete')}
                <Check size={16} />
              </Button>
            )}
          </form.Subscribe>
        </HStack>
      </HStack>
    </Container>
  )
}
