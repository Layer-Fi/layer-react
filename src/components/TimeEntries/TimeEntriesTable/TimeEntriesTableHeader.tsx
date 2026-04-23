import { useCallback, useMemo } from 'react'
import { Clock3, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTimeEntriesDrawer, useTimeEntriesFilters, useTimeEntriesTimerConfig } from '@providers/TimeEntriesStore/TimeEntriesStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { DataTableHeader } from '@components/DataTable/DataTableHeader'
import { TimeEntryServiceSelector } from '@components/TimeEntries/TimeEntryServiceSelector/TimeEntryServiceSelector'

import './timeEntriesTableHeader.scss'

export const TimeEntriesTableHeader = () => {
  const { t } = useTranslation()
  const { setDrawerOpen } = useTimeEntriesDrawer()
  const { selectedCustomer, selectedServiceId, setSelectedCustomer, setSelectedServiceId } = useTimeEntriesFilters()
  const { onStartTimer, isStartTimerDisabled } = useTimeEntriesTimerConfig()

  const onAddEntry = useCallback(() => setDrawerOpen(true, null), [setDrawerOpen])

  const HeaderActions = useCallback(() => (
    <HStack gap='xs'>
      <Button variant='outlined-light' onPress={onAddEntry}>
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

  const HeaderFilters = useCallback(() => (
    <HStack gap='sm' align='end' className='Layer__TimeEntriesTable__Filters'>
      <TimeEntryServiceSelector
        selectedServiceId={selectedServiceId}
        onSelectedServiceIdChange={setSelectedServiceId}
        className='Layer__TimeEntriesTable__FilterService'
        placeholder={t('timeTracking:label.all_services', 'All Services')}
        showLabel={false}
        allowArchived
        inline
      />
      <CustomerSelector
        selectedCustomer={selectedCustomer}
        onSelectedCustomerChange={setSelectedCustomer}
        isCreatable={false}
        className='Layer__TimeEntriesTable__FilterCustomer'
        placeholder={t('timeTracking:label.all_customers', 'All Customers')}
        showLabel={false}
        inline
      />
    </HStack>
  ), [selectedCustomer, setSelectedCustomer, selectedServiceId, setSelectedServiceId, t])

  const headerSlots = useMemo(
    () => ({ HeaderActions, HeaderFilters }),
    [HeaderActions, HeaderFilters],
  )

  return (
    <DataTableHeader
      name={t('timeTracking:label.time_entries', 'Time Entries')}
      slots={headerSlots}
    />
  )
}
