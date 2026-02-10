import { useCallback, useEffect, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import { endOfYesterday, startOfToday } from 'date-fns'
import { HandCoins, Plus, Search } from 'lucide-react'

import { convertCentsToCurrency, formatDate } from '@utils/format'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { useDebouncedSearchInput } from '@hooks/search/useDebouncedSearchQuery'
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
import { getCustomerName } from '@features/customers/util'
import { type ListInvoicesFilterParams, useListInvoices } from '@features/invoices/api/useListInvoices'
import { type Invoice, InvoiceStatus } from '@features/invoices/invoiceSchemas'

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
const InvoiceStatusOptionConfig = {
  [InvoiceStatusFilter.All]: { label: 'All', value: InvoiceStatusFilter.All },
  [InvoiceStatusFilter.Unpaid]: { label: 'Unpaid', value: InvoiceStatusFilter.Unpaid },
  [InvoiceStatusFilter.Overdue]: { label: 'Overdue', value: InvoiceStatusFilter.Overdue },
  [InvoiceStatusFilter.Sent]: { label: 'Sent', value: InvoiceStatusFilter.Sent },
  [InvoiceStatusFilter.Paid]: { label: 'Paid', value: InvoiceStatusFilter.Paid },
  [InvoiceStatusFilter.Voided]: { label: 'Voided', value: InvoiceStatusFilter.Voided },
  [InvoiceStatusFilter.Refunded]: { label: 'Refunded', value: InvoiceStatusFilter.Refunded },
  [InvoiceStatusFilter.WrittenOff]: { label: 'Written Off', value: InvoiceStatusFilter.WrittenOff },
}
export const ALL_OPTION = InvoiceStatusOptionConfig[InvoiceStatusFilter.All]

const AmountCell = ({ invoice }: { invoice: Invoice }) => {
  const totalAmount = convertCentsToCurrency(invoice.totalAmount)
  const outstandingBalance = convertCentsToCurrency(invoice.outstandingBalance)

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
            {outstandingBalance}
            {' '}
            outstanding
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
const getColumnConfig = (onViewInvoice: (invoice: Invoice) => void): NestedColumnConfig<Invoice> => [
  {
    id: InvoiceColumns.SentAt,
    header: 'Sent Date',
    cell: (row: InvoiceRowType) => row.original.sentAt ? formatDate(row.original.sentAt) : null,
  },
  {
    id: InvoiceColumns.InvoiceNo,
    header: 'No.',
    cell: (row: InvoiceRowType) => <Span ellipsis>{row.original.invoiceNumber}</Span>,
    isRowHeader: true,
  },
  {
    id: InvoiceColumns.Customer,
    header: 'Customer',
    cell: (row: InvoiceRowType) => <Span ellipsis>{getCustomerName(row.original.customer)}</Span>,
  },
  {
    id: InvoiceColumns.Total,
    header: 'Amount',
    cell: (row: InvoiceRowType) => <AmountCell invoice={row.original} />,
  },
  {
    id: InvoiceColumns.Status,
    header: 'Status',
    cell: (row: InvoiceRowType) => <InvoiceStatusCell invoice={row.original} />,
  },
  {
    id: InvoiceColumns.Expand,
    cell: (row: InvoiceRowType) => (
      <Button inset icon onPress={() => onViewInvoice(row.original)} aria-label='View invoice' variant='ghost'>
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

  const paginationMeta = data?.[data.length - 1]?.meta.pagination
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

  const options: InvoiceStatusOption[] = useMemo(() => Object.values(InvoiceStatusOptionConfig), [])

  const SingleValue = useCallback(() => {
    const label = selectedInvoiceStatusOption.label
    return label ? `Status: ${label}` : 'Status'
  }, [selectedInvoiceStatusOption.label])

  const StatusFilter = useCallback(() => (
    <ComboBox
      className='Layer__InvoiceTable__StatusFilter'
      options={options}
      onSelectedValueChange={option => option && setTableFilters({ status: option })}
      selectedValue={selectedInvoiceStatusOption}
      isSearchable={false}
      isClearable={false}
      placeholder='Status'
      slots={{ SingleValue }}
      aria-label='Status Filter'
    />
  ),
  [SingleValue, options, selectedInvoiceStatusOption, setTableFilters])

  const CreateInvoiceButton = useCallback(() => (
    <Button onPress={toCreateInvoice}>
      Create Invoice
      <Plus size={16} />
    </Button>
  ),
  [toCreateInvoice])

  const InvoiceTableEmptyState = useCallback(() => {
    const isFiltered = selectedInvoiceStatusOption && selectedInvoiceStatusOption !== ALL_OPTION

    return (
      <DataState
        status={DataStateStatus.allDone}
        title={isFiltered ? 'No results found' : 'No invoices yet'}
        description={
          isFiltered
            ? 'We couldn’t find any invoices with the current filters. Try changing or clearing them to see more results.'
            : 'Add your first invoice to start tracking what your customers owe you.'
        }
        icon={isFiltered ? <Search /> : <HandCoins />}
        spacing
      />
    )
  }, [selectedInvoiceStatusOption])

  const InvoiceTableErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title='We couldn’t load your invoices'
      description='An error occurred while loading your invoices. Please check your connection and try again.'
      onRefresh={() => { void refetch() }}
      spacing
    />
  ), [refetch])

  const columnConfig = useMemo(() => getColumnConfig(toViewInvoice), [toViewInvoice])

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
            label: 'Search invoices',
            value: inputValue,
            onChange: handleInputChange,
            className: 'Layer__InvoiceTable__SearchField',
          },
        }}
      />
      <PaginatedTable
        ariaLabel='Invoices'
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
