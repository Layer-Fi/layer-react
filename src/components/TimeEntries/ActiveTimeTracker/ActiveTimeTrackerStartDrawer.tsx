import { useCallback, useMemo } from 'react'
import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { TextField } from '@ui/Form/Form'
import { TextArea } from '@ui/Input/TextArea'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { useStartTimerForm } from '@components/TimeEntries/ActiveTimeTracker/useStartTimerForm'
import { TimeEntryServiceSelector } from '@components/TimeEntries/TimeEntryServiceSelector/TimeEntryServiceSelector'

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

const ActiveTimerDurationDisplay = ({ duration }: { duration: string }) => {
  const { t } = useTranslation()

  return (
    <VStack align='center' gap='2xs' pb='md'>
      <Span className='Layer__ActiveTimeTracker__DurationValue'>{duration}</Span>
      <Span className='Layer__ActiveTimeTracker__DurationLabel' size='xs' weight='bold'>
        {t('timeTracking:label.duration', 'Duration')}
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
  const { formatSecondsAsDuration } = useIntlFormatter()

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

  const duration = useMemo(() => formatSecondsAsDuration(0), [formatSecondsAsDuration])

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable
      variant={isMobile ? 'mobile-drawer' : 'drawer'}
      flexBlock={isMobile}
      aria-label={t('timeTracking:action.start_timer', 'Start Timer')}
      slots={{
        Header: ({ close }) => (
          <ActiveTimeTrackerDrawerHeader
            title={t('timeTracking:action.start_timer', 'Start Timer')}
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

        <ActiveTimerDurationDisplay duration={duration} />

        <VStack gap='md'>
          <form.Field name='selectedServiceId'>
            {field => (
              <TimeEntryServiceSelector
                selectedServiceId={field.state.value}
                onSelectedServiceIdChange={field.handleChange}
                inline
                className='Layer__ActiveTimeTracker__Field__Service'
              />
            )}
          </form.Field>

          <form.Field name='selectedCustomer'>
            {field => (
              <CustomerSelector
                selectedCustomer={field.state.value}
                onSelectedCustomerChange={field.handleChange}
                inline
                placeholder={t('timeTracking:label.select_customer', 'Select a customer (optional)')}
                className='Layer__ActiveTimeTracker__Field__Customer'
              />
            )}
          </form.Field>

          <form.Field name='memo'>
            {field => (
              <TextField
                name='active-time-tracker-memo'
                inline
                textarea
                className='Layer__ActiveTimeTracker__Field__Memo'
              >
                <Label slot='label' size='sm' htmlFor='active-time-tracker-memo'>
                  {t('timeTracking:label.memo', 'Memo')}
                </Label>
                <TextArea
                  slot='input'
                  id='active-time-tracker-memo'
                  name='active-time-tracker-memo'
                  value={field.state.value}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder={t('timeTracking:label.add_memo', 'Add memo')}
                />
              </TextField>
            )}
          </form.Field>

          <form.Subscribe selector={s => s.values.selectedServiceId}>
            {selectedServiceId => (
              <HStack pie='lg' gap='xs' justify='end' pbs='sm'>
                <Button
                  onPress={() => { void form.handleSubmit() }}
                  isPending={state.isStarting}
                  isDisabled={!selectedServiceId}
                >
                  <Play size={16} />
                  {t('timeTracking:action.start_timer', 'Start Timer')}
                </Button>
              </HStack>
            )}
          </form.Subscribe>
        </VStack>
      </VStack>
    </Drawer>
  )
}
