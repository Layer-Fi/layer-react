import { useCallback } from 'react'
import { HandCoins, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { useInvoiceNavigation, useInvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { type DefaultVariant, ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { InvoicesMobileList } from '@components/Invoices/InvoicesMobileList/InvoicesMobileList'
import { InvoiceTable } from '@components/Invoices/InvoiceTable/InvoiceTable'
import { InvoiceStatusFilter } from '@components/Invoices/utils/invoiceFilters'
import { useInvoicesList } from '@components/Invoices/utils/useInvoicesList'

const resolveVariant = ({ width }: { width: number }): DefaultVariant =>
  width < BREAKPOINTS.TABLET ? 'Mobile' : 'Desktop'

export const ResponsiveInvoiceView = () => {
  const { t } = useTranslation()
  const { toCreateInvoice, toViewInvoice } = useInvoiceNavigation()
  const { tableFilters } = useInvoiceTableFilters()
  const { invoices, isLoading, isError, paginationProps, refetch } = useInvoicesList()

  const EmptyState = useCallback(() => {
    const isFiltered = tableFilters.status?.value !== InvoiceStatusFilter.All

    return (
      <DataState
        status={DataStateStatus.allDone}
        title={isFiltered ? t('common:empty.results', 'No results found') : t('invoices:empty.invoices', 'No invoices yet')}
        description={
          isFiltered
            ? t('invoices:empty.invoices_filtered', 'We couldn’t find any invoices with the current filters. Try changing or clearing them to see more results.')
            : t('invoices:empty.add_first_invoice', 'Add your first invoice to start tracking what your customers owe you.')
        }
        icon={isFiltered ? <Search /> : <HandCoins />}
        spacing
      />
    )
  }, [tableFilters.status?.value, t])

  const ErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title={t('invoices:error.couldnt_load_invoices', 'We couldn’t load your invoices')}
      description={t('invoices:error.load_invoices', 'An error occurred while loading your invoices. Please check your connection and try again.')}
      onRefresh={() => { void refetch() }}
      spacing
    />
  ), [refetch, t])

  const slots = { EmptyState, ErrorState }

  const DesktopView = (
    <InvoiceTable
      data={invoices}
      isLoading={isLoading}
      isError={isError}
      paginationProps={paginationProps}
      onViewInvoice={toViewInvoice}
      onCreateInvoice={toCreateInvoice}
      slots={slots}
    />
  )

  const MobileView = (
    <InvoicesMobileList
      data={invoices}
      isLoading={isLoading}
      isError={isError}
      paginationProps={paginationProps}
      onViewInvoice={toViewInvoice}
      onCreateInvoice={toCreateInvoice}
      slots={slots}
    />
  )

  return (
    <ResponsiveComponent
      resolveVariant={resolveVariant}
      slots={{ Desktop: DesktopView, Mobile: MobileView }}
    />
  )
}
