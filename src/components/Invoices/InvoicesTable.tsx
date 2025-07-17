import { useCallback, useMemo, useState } from 'react'
import { useListInvoices } from '../../features/invoices/api/useListInvoices'
import { type Invoice, InvoiceStatus } from '../../features/invoices/invoiceSchemas'
import { convertCentsToCurrency, formatDate } from '../../utils/format'
import { unsafeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import { Badge, BadgeVariant } from '../Badge'
import { Container } from '../Container'
import type { ColumnConfig } from '../DataTable/DataTable'
import { PaginatedTable } from '../DataTable/PaginatedTable'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Span } from '../ui/Typography/Text'
import { getDueDifference } from '../../utils/time/timeUtils'
import pluralize from 'pluralize'
import { BadgeSize } from '../Badge/Badge'
import AlertCircle from '../../icons/AlertCircle'
import CheckCircle from '../../icons/CheckCircle'
import { Button } from '../ui/Button/Button'
import ChevronRightFill from '../../icons/ChevronRightFill'
import { DataState, DataStateStatus } from '../DataState/DataState'
import { HandCoins, Search } from 'lucide-react'
import { DataTableHeader } from '../DataTable/DataTableHeader'
import Plus from '../../icons/Plus'
import { ComboBox } from '../ui/ComboBox/ComboBox'
import { startOfToday, endOfYesterday } from 'date-fns'

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

const getDueStatusConfig = (invoice: Invoice) => {
  switch (invoice.status) {
    case InvoiceStatus.WrittenOff: {
      return { text: 'Written Off' }
    }
    case InvoiceStatus.PartiallyWrittenOff: {
      return { text: 'Partially Written Off' }
    }
    case InvoiceStatus.Paid: {
      return {
        text: 'Paid',
        badge: <Badge variant={BadgeVariant.SUCCESS} size={BadgeSize.SMALL} icon={<CheckCircle size={12} />} iconOnly />,
      }
    }
    case InvoiceStatus.Voided: {
      return { text: 'Voided' }
    }
    case InvoiceStatus.Sent:
    case InvoiceStatus.PartiallyPaid: {
      if (invoice.dueAt === null) {
        return {
          text: invoice.status === InvoiceStatus.PartiallyPaid ? 'Partially Paid' : 'Sent',
        }
      }

      const dueDifference = getDueDifference(invoice.dueAt)
      if (dueDifference === 0) {
        return {
          text: 'Due Today',
        }
      }

      if (dueDifference < 0) {
        return {
          text: 'Overdue',
          subText: `Due ${pluralize('day', Math.abs(dueDifference), true)} ago`,
          badge: <Badge variant={BadgeVariant.WARNING} size={BadgeSize.SMALL} icon={<AlertCircle size={12} />} iconOnly />,
        }
      }

      return {
        text: 'Sent',
        subText: `Due in ${pluralize('day', Math.abs(dueDifference), true)}`,
      }
    }
    default: {
      unsafeAssertUnreachable({
        value: invoice.status,
        message: 'Unexpected invoice status',
      })
    }
  }
}

const StatusCell = ({ invoice }: { invoice: Invoice }) => {
  const dueStatus = getDueStatusConfig(invoice)
  return (
    <HStack gap='xs' align='center'>
      {dueStatus.badge}
      <VStack>
        <Span>{dueStatus.text}</Span>
        <Span variant='subtle' size='sm'>{dueStatus.subText}</Span>
      </VStack>
    </HStack>
  )
}

const getCustomerName = (invoice: Invoice) => {
  const { recipientName, customer } = invoice
  return recipientName || customer?.individualName || customer?.companyName
}
const columns: ColumnConfig<Invoice, InvoiceColumns> = {
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
    cell: row => <StatusCell invoice={row} />,
  },
  [InvoiceColumns.Expand]: {
    id: InvoiceColumns.Expand,
    cell: _row => <Button inset icon aria-label='View invoice' variant='ghost'><ChevronRightFill /></Button>,
  },
}

const unpaidStatuses = [InvoiceStatus.Sent, InvoiceStatus.PartiallyPaid]
const getListInvoiceParams = ({ statusFilter }: { statusFilter: InvoiceStatusFilter | undefined }) => {
  if (!statusFilter) return {}

  switch (statusFilter) {
    case InvoiceStatusFilter.All:
      return {}

    case InvoiceStatusFilter.Unpaid:
      return { status: unpaidStatuses }

    case InvoiceStatusFilter.Overdue:
      return { status: unpaidStatuses, dueAtEnd: endOfYesterday() }

    case InvoiceStatusFilter.Sent:
      return { status: unpaidStatuses, dueAtStart: startOfToday() }

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

export const InvoicesTable = () => {
  const [selectedInvoiceStatusOption, setSelectedInvoiceStatusOption] = useState<InvoiceStatusOption | null>(ALL_OPTION)

  const listInvoiceParams = useMemo(
    () => getListInvoiceParams({ statusFilter: selectedInvoiceStatusOption?.value }),
    [selectedInvoiceStatusOption?.value],
  )

  const { data, isLoading, size, setSize } = useListInvoices({ ...listInvoiceParams })
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
    />
  ),
  [SelectedValue, options, selectedInvoiceStatusOption])

  const CreateInvoiceButton = useCallback(() => (
    <Button>
      Create Invoice
      <Plus size={16} />
    </Button>
  ),
  [])

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
        columnConfig={columns}
        paginationProps={paginationProps}
        componentName={COMPONENT_NAME}
        slots={{ EmptyState: InvoicesTableEmptyState }}
      />
    </Container>
  )
}
