import { useCallback, useEffect, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import { endOfYesterday, startOfToday } from 'date-fns'
import type { TFunction } from 'i18next'
import { HandCoins, Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { getCustomerName } from '@utils/customerVendor'
import { convertCentsToCurrency, formatDate } from '@utils/format'
import { translationKey } from '@utils/i18n/translationKey'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { type ListInvoicesFilterParams, useListInvoices } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { type InvoiceTableFilters, useInvoiceNavigation, useInvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import ChevronRightFill from '@icons/ChevronRightFill'
import { Button } from '@ui/Button/Button'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { DataTableHeader } from '@components/DataTable/DataTableHeader'
import { InvoiceStatusCell } from '@components/Invoices/InvoiceStatusCell/InvoiceStatusCell'
import { PaginatedTable } from '@components/PaginatedDataTable/PaginatedDataTable'

import './invoiceTable.scss'

const COMPONENT_NAME = 'InvoiceTable'

enum InvoiceColumns {
  SentAt = 'SentAt',
  InvoiceNo = 'InvoiceNo',
  Customer = 'Customer',
  Total = 'Total',
  Status = 'Status',
  Expand = 'Expand',
}

enum InvoiceStatusFilter {
  All = 'All',
  Unpaid = 'Unpaid',
  Overdue = 'Overdue',
  Sent = 'Sent',
  Paid = 'Paid',
  WrittenOff = 'Written Off',
  Voided = 'Voided',
  Refunded = 'Refunded',
}

export type InvoiceStatusOption = {
  label: string
  value: InvoiceStatusFilter
}

const INVOICE_STATUS_CONFIG = [
  { value: InvoiceStatusFilter.All, ...translationKey('common:all', 'All') },
  { value: InvoiceStatusFilter.Unpaid, ...translationKey('invoices:unpaid', 'Unpaid') },
  { value: InvoiceStatusFilter.Overdue, ...translationKey('invoices:overdue', 'Overdue') },
  { value: InvoiceStatusFilter.Sent, ...translationKey('invoices:sent', 'Sent') },
  { value: InvoiceStatusFilter.Paid, ...translationKey('invoices:paid', 'Paid') },
  { value: InvoiceStatusFilter.Voided, ...translationKey('invoices:voided', 'Voided') },
  { value: InvoiceStatusFilter.Refunded, ...translationKey('invoices:refunded', 'Refunded') },
  { value: InvoiceStatusFilter.WrittenOff, ...translationKey('invoices:writtenOff', 'Written Off') },
]

export const ALL_OPTION: InvoiceStatusOption = { value: InvoiceStatusFilter.All, label: 'All' }

const AmountCell = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation()
  const totalAmount = convertCentsToCurrency(invoice.totalAmount)
  const outstandingBalance = convertCentsToCurrency(invoice.outstandingBalance)
  const outstandingBalanceLabel = t('invoices:invoiceOutstandingBalance', '{{amount}} outstanding', { amount: outstandingBalance })

  switch (invoice.status) {
    case InvoiceStatus.Paid:
    case InvoiceStatus.PartiallyWrittenOff:
    case InvoiceStatus.WrittenOff:
    case InvoiceStatus.Voided:
    case InvoiceStatus.Refunded:
    case InvoiceStatus.Sent: {
      return <Span align='right'>{totalAmount}</Span>
    }
    case InvoiceStatus.PartiallyPaid: {
      return (
        <VStack>
          <Span align='right'>{totalAmount}</Span>
          <Span align='right' variant='subtle' size='sm'>
            {outstandingBalanceLabel}
          </Span>
        </VStack>
      )
    }
    default: {
      unsafeAssertUnreachable({
        value: invoice.status,
        message: 'Unexpected invoice status',
      })
    }
  }
}

type InvoiceRowType = Row<Invoice>
const getColumnConfig = (
  onViewInvoice: (invoice: Invoice) => void,
  t: TFunction,
): NestedColumnConfig<Invoice> => [
  {
    id: InvoiceColumns.SentAt,
    header: t('invoices:sentDate', 'Sent Date'),
    cell: (row: InvoiceRowType) => row.original.sentAt ? formatDate(row.original.sentAt) : null,
  },
  {
    id: InvoiceColumns.InvoiceNo,
    header: t('invoices:numberAbbreviation', 'No.'),
    cell: (row: InvoiceRowType) => <Span ellipsis>{row.original.invoiceNumber}</Span>,
    isRowHeader: true,
  },
  {
    id: InvoiceColumns.Customer,
    header: t('customerVendor:customer', 'Customer'),
    cell: (row: InvoiceRowType) => <Span ellipsis>{getCustomerName(row.original.customer)}</Span>,
  },
  {
    id: InvoiceColumns.Total,
    header: t('common:amount', 'Amount'),
    cell: (row: InvoiceRowType) => <AmountCell invoice={row.original} />,
  },
  {
    id: InvoiceColumns.Status,
    header: t('common:status', 'Status'),
    cell: (row: InvoiceRowType) => <InvoiceStatusCell invoice={row.original} />,
  },
  {
    id: InvoiceColumns.Expand,
    cell: (row: InvoiceRowType) => (
      <Button inset icon onPress={() => onViewInvoice(row.original)} aria-label={t('invoices:viewInvoice', 'View invoice')} variant='ghost'>
        <ChevronRightFill />
      </Button>
    ),
  },
]

const UNPAID_STATUSES = [InvoiceStatus.Sent, InvoiceStatus.PartiallyPaid]
const getStatusFilterParams = (statusFilter: InvoiceStatusFilter) => {
  switch (statusFilter) {
    case InvoiceStatusFilter.All:
      return {}

    case InvoiceStatusFilter.Unpaid:
      return { status: UNPAID_STATUSES }

    case InvoiceStatusFilter.Overdue:
      return { status: UNPAID_STATUSES, dueAtEnd: endOfYesterday() }

    case InvoiceStatusFilter.Sent:
      return { status: UNPAID_STATUSES, dueAtStart: startOfToday() }

    case InvoiceStatusFilter.Paid:
      return { status: [InvoiceStatus.Paid, InvoiceStatus.PartiallyWrittenOff] }

    case InvoiceStatusFilter.WrittenOff:
      return { status: [InvoiceStatus.WrittenOff, InvoiceStatus.PartiallyWrittenOff] }

    case InvoiceStatusFilter.Voided:
      return { status: [InvoiceStatus.Voided] }

    case InvoiceStatusFilter.Refunded:
      return { status: [InvoiceStatus.Refunded] }

    default:
      unsafeAssertUnreachable({
        value: statusFilter,
        message: 'Unexpected status filter',
      })
  }
}

const getListInvoiceParams = ({ status, query }: InvoiceTableFilters): ListInvoicesFilterParams => {
  const statusFilterParams = getStatusFilterParams(status.value)
  return { ...statusFilterParams, query }
}

export const InvoiceTable = () => {
  const { t } = useTranslation()
  const { toCreateInvoice, toViewInvoice } = useInvoiceNavigation()
  const { tableFilters, setTableFilters } = useInvoiceTableFilters()
  const { status: selectedInvoiceStatusOption, query } = tableFilters

  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: query })

  useEffect(() => {
    setTableFilters({ query: searchQuery })
  }, [searchQuery, setTableFilters])

  const listInvoiceParams = useMemo(
    () => getListInvoiceParams(tableFilters),
    [tableFilters],
  )

  const { data, isLoading, isError, size, setSize, refetch } = useListInvoices({ ...listInvoiceParams })
  const invoices = useMemo(() => data?.flatMap(({ data }) => data), [data])

  const paginationMeta = data?.[data.length - 1].meta.pagination
  const hasMore = paginationMeta?.hasMore

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const paginationProps = useMemo(() => {
    return {
      pageSize: 10,
      hasMore,
      fetchMore,
    }
  }, [fetchMore, hasMore])

  const options: InvoiceStatusOption[] = useMemo(
    () => INVOICE_STATUS_CONFIG.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const selectedStatusOption = useMemo(
    () => options.find(o => o.value === selectedInvoiceStatusOption?.value) ?? options[0],
    [options, selectedInvoiceStatusOption?.value],
  )

  const SingleValue = useCallback(() => {
    const label = selectedStatusOption?.label
    return label ? t('invoices:statusColonLabel', 'Status: {{label}}', { label }) : t('ui:status', 'Status')
  }, [selectedStatusOption?.label, t])

  const StatusFilter = useCallback(() => (
    <ComboBox
      className='Layer__InvoiceTable__StatusFilter'
      options={options}
      onSelectedValueChange={option => option && setTableFilters({ status: option })}
      selectedValue={selectedStatusOption}
      isSearchable={false}
      isClearable={false}
      placeholder={t('common:status', 'Status')}
      slots={{ SingleValue }}
      aria-label={t('invoices:statusFilter', 'Status Filter')}
    />
  ),
  [SingleValue, options, selectedStatusOption, setTableFilters, t])

  const CreateInvoiceButton = useCallback(() => (
    <Button onPress={toCreateInvoice}>
      {t('invoices:createInvoice', 'Create Invoice')}
      <Plus size={16} />
    </Button>
  ),
  [t, toCreateInvoice])

  const InvoiceTableEmptyState = useCallback(() => {
    const isFiltered = selectedInvoiceStatusOption?.value !== InvoiceStatusFilter.All

    return (
      <DataState
        status={DataStateStatus.allDone}
        title={isFiltered ? t('common:noResultsFound', 'No results found') : t('invoices:noInvoicesYet', 'No invoices yet')}
        description={
          isFiltered
            ? t('invoices:weCouldntFindAnyInvoicesWithTheCurrentFiltersTryChangingOrClearingThemToSeeMoreResults', 'We couldn’t find any invoices with the current filters. Try changing or clearing them to see more results.')
            : t('invoices:addYourFirstInvoiceToStartTrackingWhatYourCustomersOweYou', 'Add your first invoice to start tracking what your customers owe you.')
        }
        icon={isFiltered ? <Search /> : <HandCoins />}
        spacing
      />
    )
  }, [selectedInvoiceStatusOption, t])

  const InvoiceTableErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title={t('invoices:weCouldntLoadYourInvoices', 'We couldn’t load your invoices')}
      description={t('invoices:anErrorOccurredWhileLoadingYourInvoicesPleaseCheckYourConnectionAndTryAgain', 'An error occurred while loading your invoices. Please check your connection and try again.')}
      onRefresh={() => { void refetch() }}
      spacing
    />
  ), [refetch, t])

  const columnConfig = useMemo(() => getColumnConfig(toViewInvoice, t), [toViewInvoice, t])

  return (
    <Container name='InvoiceTable'>
      <DataTableHeader
        name='Invoices'
        slots={{
          HeaderActions: CreateInvoiceButton,
          HeaderFilters: StatusFilter,
        }}
        slotProps={{
          SearchField: {
            label: t('invoices:searchInvoices', 'Search invoices'),
            value: inputValue,
            onChange: handleInputChange,
            className: 'Layer__InvoiceTable__SearchField',
          },
        }}
      />
      <PaginatedTable
        ariaLabel={t('invoices:invoices', 'Invoices')}
        data={invoices}
        isLoading={data === undefined || isLoading}
        isError={isError}
        columnConfig={columnConfig}
        paginationProps={paginationProps}
        componentName={COMPONENT_NAME}
        slots={{
          EmptyState: InvoiceTableEmptyState,
          ErrorState: InvoiceTableErrorState,
        }}
      />
    </Container>
  )
}
