import { useCallback, useMemo, useState } from 'react'
import { useListInvoices } from '../../../features/invoices/api/useListInvoices'
import { type Invoice, InvoiceStatus } from '../../../features/invoices/invoiceSchemas'
import { convertCentsToCurrency, formatDate } from '../../../utils/format'
import { unsafeAssertUnreachable } from '../../../utils/switch/assertUnreachable'
import type { ColumnConfig } from '../../DataTable/DataTable'
import { PaginatedTable } from '../../DataTable/PaginatedTable'
import { VStack } from '../../ui/Stack/Stack'
import { Span } from '../../ui/Typography/Text'
import { Button } from '../../ui/Button/Button'
import ChevronRightFill from '../../../icons/ChevronRightFill'
import { DataState, DataStateStatus } from '../../DataState/DataState'
import { HandCoins, Search, Plus } from 'lucide-react'
import { DataTableHeader } from '../../DataTable/DataTableHeader'
import { ComboBox } from '../../ui/ComboBox/ComboBox'
import { startOfToday, endOfYesterday } from 'date-fns'
import { InvoiceStatusCell } from '../InvoiceStatusCell/InvoiceStatusCell'
import { Container } from '../../Container'

const COMPONENT_NAME = 'InvoicesTable'

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
}

type InvoiceStatusOption = {
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
  [InvoiceStatusFilter.WrittenOff]: { label: 'Written Off', value: InvoiceStatusFilter.WrittenOff },
}
const ALL_OPTION = InvoiceStatusOptionConfig[InvoiceStatusFilter.All]

const AmountCell = ({ invoice }: { invoice: Invoice }) => {
  const totalAmount = convertCentsToCurrency(invoice.totalAmount)
  const outstandingBalance = convertCentsToCurrency(invoice.outstandingBalance)

  switch (invoice.status) {
    case InvoiceStatus.Paid:
    case InvoiceStatus.PartiallyWrittenOff:
    case InvoiceStatus.WrittenOff:
    case InvoiceStatus.Voided:
    case InvoiceStatus.Sent: {
      return <VStack><Span align='right'>{totalAmount}</Span></VStack>
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

const getCustomerName = (invoice: Invoice) => {
  const { recipientName, customer } = invoice
  return recipientName || customer?.individualName || customer?.companyName
}

const getColumnConfig = (onSelectInvoice: InvoicesTableProps['onSelectInvoice']): ColumnConfig<Invoice, InvoiceColumns> => ({
  [InvoiceColumns.SentAt]: {
    id: InvoiceColumns.SentAt,
    header: 'Sent Date',
    cell: row => row.sentAt ? formatDate(row.sentAt) : null,
  },
  [InvoiceColumns.InvoiceNo]: {
    id: InvoiceColumns.InvoiceNo,
    header: 'No.',
    cell: row => row.invoiceNumber,
    isRowHeader: true,
  },
  [InvoiceColumns.Customer]: {
    id: InvoiceColumns.Customer,
    header: 'Customer',
    cell: row => getCustomerName(row),
  },
  [InvoiceColumns.Total]: {
    id: InvoiceColumns.Total,
    header: 'Amount',
    cell: row => <AmountCell invoice={row} />,
  },
  [InvoiceColumns.Status]: {
    id: InvoiceColumns.Status,
    header: 'Status',
    cell: row => <InvoiceStatusCell invoice={row} />,
  },
  [InvoiceColumns.Expand]: {
    id: InvoiceColumns.Expand,
    cell: row => (
      <Button inset icon onPress={() => onSelectInvoice(row)} aria-label='View invoice' variant='ghost'>
        <ChevronRightFill />
      </Button>
    ),
  },
})

const UNPAID_STATUSES = [InvoiceStatus.Sent, InvoiceStatus.PartiallyPaid]
const getListInvoiceParams = ({ statusFilter }: { statusFilter: InvoiceStatusFilter | undefined }) => {
  if (!statusFilter) return {}

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

    default:
      unsafeAssertUnreachable({
        value: statusFilter,
        message: 'Unexpected status filter',
      })
  }
}

interface InvoicesTableProps {
  onCreateInvoice: () => void
  onSelectInvoice: (invoice: Invoice) => void
}

export const InvoicesTable = ({ onCreateInvoice, onSelectInvoice }: InvoicesTableProps) => {
  const [selectedInvoiceStatusOption, setSelectedInvoiceStatusOption] = useState<InvoiceStatusOption | null>(ALL_OPTION)

  const listInvoiceParams = useMemo(
    () => getListInvoiceParams({ statusFilter: selectedInvoiceStatusOption?.value }),
    [selectedInvoiceStatusOption?.value],
  )

  const { data, isLoading, isError, size, setSize, refetch } = useListInvoices({ ...listInvoiceParams })
  const invoices = data?.flatMap(({ data }) => data)

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

  const options: InvoiceStatusOption[] = useMemo(() => Object.values(InvoiceStatusOptionConfig), [])

  const SelectedValue = useMemo(() => {
    const label = selectedInvoiceStatusOption?.label
    return label ? `Status: ${label}` : 'Status'
  }, [selectedInvoiceStatusOption?.label])

  const StatusFilter = useCallback(() => (
    <ComboBox
      className='Layer__InvoicesTable__StatusFilter'
      options={options}
      onSelectedValueChange={option => setSelectedInvoiceStatusOption(option)}
      selectedValue={selectedInvoiceStatusOption}
      isSearchable={false}
      isClearable={false}
      placeholder='Status'
      slots={{ SelectedValue }}
      aria-label='Status Filter'
    />
  ),
  [SelectedValue, options, selectedInvoiceStatusOption])

  const CreateInvoiceButton = useCallback(() => (
    <Button onPress={onCreateInvoice}>
      Create Invoice
      <Plus size={16} />
    </Button>
  ),
  [onCreateInvoice])

  const InvoicesTableEmptyState = useCallback(() => {
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

  const InvoicesTableErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title='We couldn’t load your invoices'
      description='An error occurred while loading your invoices. Please check your connection and try again.'
      onRefresh={() => { void refetch() }}
      spacing
    />
  ), [refetch])

  const columnConfig = useMemo(() => getColumnConfig(onSelectInvoice), [onSelectInvoice])

  return (
    <Container name='InvoicesTable'>
      <DataTableHeader
        name='Invoices'
        slots={{
          HeaderActions: CreateInvoiceButton,
          HeaderFilters: StatusFilter,
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
          EmptyState: InvoicesTableEmptyState,
          ErrorState: InvoicesTableErrorState,
        }}
      />
    </Container>
  )
}
