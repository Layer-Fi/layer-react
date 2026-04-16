import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
import { Button } from '@ui/Button/Button'
import { TextField } from '@ui/Form/Form'
import { TextArea } from '@ui/Input/TextArea'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TimeEntryServiceSelector } from '@components/TimeEntries/TimeEntryServiceSelector/TimeEntryServiceSelector'

type ActiveTimeTrackerStartDrawerProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isMobile: boolean
  actionError: string | null
  duration: string
  selectedServiceId: string | null
  onSelectedServiceIdChange: (serviceId: string | null) => void
  selectedCustomer: Customer | null
  onSelectedCustomerChange: (customer: Customer | null) => void
  memo: string
  onMemoChange: (memo: string) => void
  onStartTimer: () => void
  isStarting: boolean
  isStopping: boolean
  isCancelling: boolean
  canStartTimer: boolean
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
    <VStack className='Layer__ActiveTimeTracker__DurationDisplay' align='center' gap='2xs'>
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
  actionError,
  duration,
  selectedServiceId,
  onSelectedServiceIdChange,
  selectedCustomer,
  onSelectedCustomerChange,
  memo,
  onMemoChange,
  onStartTimer,
  isStarting,
  isStopping,
  isCancelling,
  canStartTimer,
}: ActiveTimeTrackerStartDrawerProps) => {
  const { t } = useTranslation()

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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
        {actionError && (
          <DataState
            status={DataStateStatus.failed}
            title={actionError}
            inline
          />
        )}

        <ActiveTimerDurationDisplay duration={duration} />

        <VStack gap='md'>
          <TimeEntryServiceSelector
            selectedServiceId={selectedServiceId}
            onSelectedServiceIdChange={onSelectedServiceIdChange}
            inline
            className='Layer__ActiveTimeTracker__Field__Service'
          />

          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onSelectedCustomerChange={onSelectedCustomerChange}
            inline
            placeholder={t('timeTracking:label.select_customer', 'Select a customer (optional)')}
            className='Layer__ActiveTimeTracker__Field__Customer'
          />

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
              value={memo}
              onChange={e => onMemoChange(e.target.value)}
              placeholder={t('timeTracking:label.add_memo', 'Add memo')}
            />
          </TextField>

          <HStack pie='lg' gap='xs' justify='end' pbs='sm'>
            <Button
              onPress={onStartTimer}
              isPending={isStarting}
              isDisabled={!canStartTimer || isStopping || isCancelling}
            >
              <Play size={16} />
              {t('timeTracking:action.start_timer', 'Start Timer')}
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Drawer>
  )
}
