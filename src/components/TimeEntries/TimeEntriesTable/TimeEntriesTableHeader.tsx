import { useCallback, useMemo } from 'react'
import { Clock3, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Customer } from '@schemas/customer'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { DataTableHeader } from '@components/DataTable/DataTableHeader'
import { TimeEntryServiceSelector } from '@components/TimeEntries/TimeEntryServiceSelector/TimeEntryServiceSelector'

import './timeEntriesTableHeader.scss'

interface TimeEntriesTableHeaderProps {
  onAddEntry: () => void
  onStartTimer?: () => void
  isStartTimerDisabled?: boolean
  selectedCustomer: Customer | null
  onSelectedCustomerChange: (customer: Customer | null) => void
  selectedServiceId: string | null
  onSelectedServiceIdChange: (serviceId: string | null) => void
}

export const TimeEntriesTableHeader = ({
  onAddEntry,
  onStartTimer,
  isStartTimerDisabled,
  selectedCustomer,
  onSelectedCustomerChange,
  selectedServiceId,
  onSelectedServiceIdChange,
}: TimeEntriesTableHeaderProps) => {
  const { t } = useTranslation()

  const HeaderActions = useCallback(() => (
    <HStack gap='xs'>
      <Button onPress={onAddEntry}>
        {t('timeTracking:action.add_entry', 'Add Entry')}
        <Plus size={16} />
      </Button>
      {onStartTimer && (
        <Button
          onPress={onStartTimer}
          isDisabled={isStartTimerDisabled}
        >
          {t('timeTracking:action.start_timer', 'Start timer')}
          <Clock3 size={16} />
        </Button>
      )}
    </HStack>
  ), [t, onAddEntry, onStartTimer, isStartTimerDisabled])

  const Filters = useMemo(
    () => () => (
      <HStack gap='lg' align='end' className='Layer__TimeEntriesTable__Filters'>
        <CustomerSelector
          selectedCustomer={selectedCustomer}
          onSelectedCustomerChange={onSelectedCustomerChange}
          isCreatable={false}
          className='Layer__TimeEntriesTable__FilterCustomer'
          placeholder={t('timeTracking:label.all_customers', 'All Customers')}
        />
        <TimeEntryServiceSelector
          selectedServiceId={selectedServiceId}
          onSelectedServiceIdChange={onSelectedServiceIdChange}
          className='Layer__TimeEntriesTable__FilterService'
          placeholder={t('timeTracking:label.all_services', 'All Services')}
        />
      </HStack>
    ),
    [
      selectedCustomer,
      onSelectedCustomerChange,
      selectedServiceId,
      onSelectedServiceIdChange,
      t,
    ],
  )

  const headerSlots = useMemo(
    () => ({ HeaderActions, Filters }),
    [HeaderActions, Filters],
  )

  return (
    <DataTableHeader
      name={t('timeTracking:label.time_entries', 'Time Entries')}
      slots={headerSlots}
    />
  )
}
