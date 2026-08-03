import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type TablePaginationProps } from '@internal-types/utility/pagination'
import { type Invoice } from '@schemas/invoices/invoice'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import { InvoicesMobileHeader } from '@features/invoices/InvoicesMobileHeader/InvoicesMobileHeader'
import { InvoicesMobileListItem } from '@features/invoices/InvoicesMobileList/InvoicesMobileListItem'
import { InvoicesMobileListItemStatusFooter } from '@features/invoices/InvoicesMobileList/InvoicesMobileListItemStatusFooter'

export interface InvoicesMobileListProps {
  data: Invoice[] | undefined
  isLoading: boolean
  isError: boolean
  paginationProps: TablePaginationProps
  onViewInvoice: (invoice: Invoice) => void
  onCreateInvoice: () => void
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
  slots,
}: InvoicesMobileListProps) => {
  const { t } = useTranslation()
  const renderItem = useCallback((invoice: Invoice) => <InvoicesMobileListItem invoice={invoice} />, [])
  const renderFooter = useCallback((invoice: Invoice) => <InvoicesMobileListItemStatusFooter invoice={invoice} />, [])

  return (
    <div className='Layer__InvoicesMobileList'>
      <InvoicesMobileHeader onCreateInvoice={onCreateInvoice} />
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
