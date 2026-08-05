import { useCallback } from 'react'
import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useTimeTrackingServicesDrawer } from '@providers/features/timeTracking/TimeTrackingServicesDrawerProvider/TimeTrackingServicesDrawerProvider'
import { Button } from '@ui/Button/Button'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { CustomerSelector } from '@features/customerVendor/CustomerSelector/CustomerSelector'
import { TimeEntryServiceSelector } from '@features/timeTracking/TimeEntryServiceSelector/TimeEntryServiceSelector'

import { useStartTimerForm } from './useStartTimerForm'

type ActiveTimeTrackerStartDrawerProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isMobile: boolean
}

const ActiveTimeTrackerDrawerHeader = ({ title, close, isMobile }: { title: string, close: () => void, isMobile: boolean }) => (
  <ModalTitleWithClose
    heading={<ModalHeading size='md'>{title}</ModalHeading>}
    onClose={close}
    hideBottomPadding={isMobile}
  />
)

const ActiveTimerDurationDisplay = () => {
  const { t } = useTranslation()
  const { formatSecondsAsDuration } = useIntlFormatter()

  return (
    <VStack align='center' gap='2xs' pb='md'>
      <Span className='Layer__ActiveTimeTracker__DurationValue' numeric='tabular-nums'>{formatSecondsAsDuration(0)}</Span>
      <Span className='Layer__ActiveTimeTracker__DurationLabel' size='xs' weight='bold'>
        {t('timeTracking:ActiveTimeTracker.ActiveTimeTrackerStartDrawer.label.duration', 'Duration')}
      </Span>
    </VStack>
  )
}

export const ActiveTimeTrackerStartDrawer = ({
  isOpen,
  onOpenChange,
  isMobile,
}: ActiveTimeTrackerStartDrawerProps) => {
  const { t } = useTranslation()
  const { openServicesDrawer } = useTimeTrackingServicesDrawer()

  const onStarted = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const { form, state, clearActionError } = useStartTimerForm({ onStarted })

  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      clearActionError()
    }
    onOpenChange(nextIsOpen)
  }, [clearActionError, onOpenChange])

  const handleCreateService = useCallback((name: string) => {
    openServicesDrawer({ startInCreateMode: true, initialName: name })
  }, [openServicesDrawer])

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable
      variant={isMobile ? 'mobile-drawer' : 'drawer'}
      flexBlock={isMobile}
      aria-label={t('timeTracking:ActiveTimeTracker.ActiveTimeTrackerStartDrawer.action.start_timer', 'Start Timer')}
      slots={{
        Header: ({ close }) => (
          <ActiveTimeTrackerDrawerHeader
            title={t('timeTracking:ActiveTimeTracker.ActiveTimeTrackerStartDrawer.action.start_timer', 'Start Timer')}
            close={close}
            isMobile={isMobile}
          />
        ),
      }}
    >
      <VStack className='Layer__ActiveTimeTracker__DrawerContent' gap='md'>
        {state.actionError && (
          <DataState
            status={DataStateStatus.failed}
            title={state.actionError}
            inline
          />
        )}

        <ActiveTimerDurationDisplay />

        <VStack gap='md'>
          <form.Field name='selectedServiceId'>
            {field => (
              <TimeEntryServiceSelector
                selectedServiceId={field.state.value}
                onSelectedServiceIdChange={field.handleChange}
                inline
                className='Layer__ActiveTimeTracker__Field__Service'
                isCreatable
                onCreateService={handleCreateService}
              />
            )}
          </form.Field>

          <form.Field name='selectedCustomer'>
            {field => (
              <CustomerSelector
                selectedCustomer={field.state.value}
                onSelectedCustomerChange={field.handleChange}
                inline
                label={t('timeTracking:ActiveTimeTracker.ActiveTimeTrackerStartDrawer.label.customer_optional', 'Customer (optional)')}
                placeholder={t('timeTracking:ActiveTimeTracker.ActiveTimeTrackerStartDrawer.label.select_customer_short', 'Select a customer')}
                className='Layer__ActiveTimeTracker__Field__Customer'
              />
            )}
          </form.Field>

          <form.AppField name='memo'>
            {field => (
              <field.FormTextAreaField
                label={t('timeTracking:ActiveTimeTracker.ActiveTimeTrackerStartDrawer.label.memo', 'Memo')}
                inline
                placeholder={t('timeTracking:ActiveTimeTracker.ActiveTimeTrackerStartDrawer.label.add_memo', 'Add memo')}
                className='Layer__ActiveTimeTracker__Field__Memo'
              />
            )}
          </form.AppField>

          <form.Subscribe selector={s => s.values.selectedServiceId}>
            {selectedServiceId => (
              <HStack gap='xs' justify='end'>
                <Button
                  onPress={() => { void form.handleSubmit() }}
                  isPending={state.isStarting}
                  isDisabled={!selectedServiceId}
                >
                  <Play size={16} />
                  {t('timeTracking:ActiveTimeTracker.ActiveTimeTrackerStartDrawer.action.start_timer', 'Start Timer')}
                </Button>
              </HStack>
            )}
          </form.Subscribe>
        </VStack>
      </VStack>
    </Drawer>
  )
}
