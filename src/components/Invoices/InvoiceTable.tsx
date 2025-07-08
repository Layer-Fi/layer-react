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

enum InvoiceColumns {
  SentAt = 'SentAt',
  InvoiceNo = 'InvoiceNo',
  Customer = 'Customer',
  Total = 'Total',
  Status = 'Status',
  Expand = 'Expand',
}

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
        text: 'Partially Written Off',
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
    cell: _row => <Button inset icon variant='ghost'><ChevronRightFill /></Button>,
  },
}

export const InvoicesTable = () => {
  const invoicesPages = useListInvoices()
  const invoices = invoicesPages.data?.flatMap(({ data }) => data) ?? []

  return (
    <Container name='InvoiceTable'>
      <PaginatedTable
        ariaLabel='Invoices'
        data={invoices}
        columnConfig={columns}
        componentName='InvoiceTable'
      />
    </Container>
  )
}
