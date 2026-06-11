import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { type SearchProps } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import { InvoicesMobileHeader } from '@components/Invoices/InvoicesMobileHeader/InvoicesMobileHeader'
import { InvoicesMobileListItem } from '@components/Invoices/InvoicesMobileList/InvoicesMobileListItem'
import { InvoicesMobileListItemStatusFooter } from '@components/Invoices/InvoicesMobileList/InvoicesMobileListItemStatusFooter'
import { type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

export interface InvoicesMobileListProps {
  data: Invoice[] | undefined
  isLoading: boolean
  isError: boolean
  paginationProps: TablePaginationProps
  onViewInvoice: (invoice: Invoice) => void
  onCreateInvoice: () => void
  searchProps: SearchProps
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
}

export const InvoicesMobileList = ({
  data,
  isLoading,
  isError,
  paginationProps,
  onViewInvoice,
  onCreateInvoice,
  searchProps,
  slots,
}: InvoicesMobileListProps) => {
  const { t } = useTranslation()
  const renderItem = useCallback((invoice: Invoice) => <InvoicesMobileListItem invoice={invoice} />, [])
  const renderFooter = useCallback((invoice: Invoice) => <InvoicesMobileListItemStatusFooter invoice={invoice} />, [])

  return (
    <div className='Layer__InvoicesMobileList'>
      <InvoicesMobileHeader onCreateInvoice={onCreateInvoice} searchProps={searchProps} />
      <PaginatedMobileList
        ariaLabel={t('invoices:label.invoices', 'Invoices')}
        data={data}
        isLoading={isLoading}
        isError={isError}
        renderItem={renderItem}
        renderFooter={renderFooter}
        paginationProps={paginationProps}
        onClickItem={onViewInvoice}
        slots={slots}
      />
    </div>
  )
}
