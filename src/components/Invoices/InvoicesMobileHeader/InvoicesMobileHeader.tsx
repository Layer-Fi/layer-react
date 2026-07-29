import { useCallback, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useDebouncedSearchProps } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useInvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { DataTableHeader } from '@components/DataTable/DataTableHeader'
import { type InvoiceStatusOption, useInvoiceStatusOptions } from '@components/Invoices/utils/invoiceFilters'

interface InvoicesMobileHeaderProps {
  onCreateInvoice: () => void
}

export const InvoicesMobileHeader = ({ onCreateInvoice }: InvoicesMobileHeaderProps) => {
  const { t } = useTranslation()
  const { tableFilters, setTableFilters } = useInvoiceTableFilters()
  const { status: selectedInvoiceStatusOption } = tableFilters

  const searchProps = useDebouncedSearchProps({ query: tableFilters.query, setTableFilters })

  const options = useInvoiceStatusOptions()

  const selectedStatusOption = useMemo(
    () => options.find(o => o.value === selectedInvoiceStatusOption?.value) ?? options[0],
    [options, selectedInvoiceStatusOption?.value],
  )

  const HeaderActions = useCallback(() => (
    <Button onPress={onCreateInvoice}>
      {t('common:action.create_label', 'Create')}
      <Plus size={16} />
    </Button>
  ), [t, onCreateInvoice])

  const HeaderFilters = useCallback(() => (
    <MobileSelectionDrawerWithTrigger<InvoiceStatusOption>
      ariaLabel={t('invoices:label.status_filter', 'Status Filter')}
      heading={t('common:label.status', 'Status')}
      options={options}
      selectedValue={selectedStatusOption}
      onSelectedValueChange={option => option && setTableFilters({ status: option })}
      placeholder={t('common:label.status', 'Status')}
      slotProps={{
        Trigger: {
          value: option => option
            ? t('invoices:label.status_with_label', 'Status: {{label}}', { label: option.label })
            : t('common:label.status', 'Status'),
        },
      }}
    />
  ), [t, options, selectedStatusOption, setTableFilters])

  return (
    <DataTableHeader
      isMobile
      name={t('invoices:label.invoices', 'Invoices')}
      slots={{ HeaderActions, HeaderFilters }}
      slotProps={{
        SearchField: {
          label: t('invoices:label.search_invoices', 'Search invoices'),
          className: 'Layer__InvoicesMobileHeader__SearchField',
          ...searchProps,
        },
      }}
    />
  )
}
