import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type SearchProps } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useInvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Header } from '@ui/Typography/Text'
import { type InvoiceStatusOption, useInvoiceStatusOptions } from '@components/Invoices/utils/invoiceFilters'
import { SearchField } from '@components/SearchField/SearchField'

interface InvoicesMobileHeaderProps {
  onCreateInvoice: () => void
  searchProps: SearchProps
}

export const InvoicesMobileHeader = ({ onCreateInvoice, searchProps }: InvoicesMobileHeaderProps) => {
  const { t } = useTranslation()
  const { tableFilters, setTableFilters } = useInvoiceTableFilters()
  const { status: selectedInvoiceStatusOption } = tableFilters

  const options = useInvoiceStatusOptions()

  const selectedStatusOption = useMemo(
    () => options.find(o => o.value === selectedInvoiceStatusOption?.value) ?? options[0],
    [options, selectedInvoiceStatusOption?.value],
  )

  return (
    <Header>
      <VStack gap='sm' pbe='md'>
        <HStack justify='space-between' align='center' gap='sm'>
          <Heading size='lg'>{t('invoices:label.invoices', 'Invoices')}</Heading>
          <Button onPress={onCreateInvoice} inset>
            {t('common:action.create_label', 'Create')}
            <Plus size={16} />
          </Button>
        </HStack>

        <SearchField
          label={t('invoices:label.search_invoices', 'Search invoices')}
          className='Layer__InvoicesMobileHeader__SearchField'
          {...searchProps}
        />

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
      </VStack>
    </Header>
  )
}
