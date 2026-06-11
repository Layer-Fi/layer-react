import { useCallback, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { getCustomerName } from '@utils/customerVendor'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { type SearchProps } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useInvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import ChevronRightFill from '@icons/ChevronRightFill'
import { Button } from '@ui/Button/Button'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import type { NestedColumnConfig } from '@components/DataTable/columnUtils'
import { DataTableHeader } from '@components/DataTable/DataTableHeader'
import { InvoiceStatusCell } from '@components/Invoices/InvoiceStatusCell/InvoiceStatusCell'
import { useInvoiceStatusOptions } from '@components/Invoices/utils/invoiceFilters'
import { PaginatedTable } from '@components/PaginatedDataTable/PaginatedDataTable'
import { type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

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

const AmountCell = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const totalAmount = formatCurrencyFromCents(invoice.totalAmount)
  const outstandingBalance = formatCurrencyFromCents(invoice.outstandingBalance)
  const outstandingBalanceLabel = t('invoices:label.amount_outstanding', '{{amount}} outstanding', { amount: outstandingBalance })

  switch (invoice.status) {
    case InvoiceStatus.Draft:
    case InvoiceStatus.Paid:
    case InvoiceStatus.PartiallyWrittenOff:
    case InvoiceStatus.WrittenOff:
    case InvoiceStatus.Voided:
    case InvoiceStatus.Refunded:
    case InvoiceStatus.Saved: {
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

const DateCell = ({ date }: { date: Date | null }) => {
  const { formatDate } = useIntlFormatter()

  if (!date) return null
  return <Span>{formatDate(date)}</Span>
}

type InvoiceRowType = Row<Invoice>
const getColumnConfig = (
  onViewInvoice: (invoice: Invoice) => void,
  t: TFunction,
): NestedColumnConfig<Invoice> => [
  {
    id: InvoiceColumns.SentAt,
    header: t('invoices:label.created_date', 'Created Date'),
    cell: (row: InvoiceRowType) => <DateCell date={row.original.sentAt} />,
  },
  {
    id: InvoiceColumns.InvoiceNo,
    header: t('invoices:label.number_abbreviation', 'No.'),
    cell: (row: InvoiceRowType) => <Span ellipsis>{row.original.invoiceNumber}</Span>,
    isRowHeader: true,
  },
  {
    id: InvoiceColumns.Customer,
    header: t('customerVendor:label.customer', 'Customer'),
    cell: (row: InvoiceRowType) => <Span ellipsis>{getCustomerName(row.original.customer)}</Span>,
  },
  {
    id: InvoiceColumns.Total,
    header: t('common:label.amount', 'Amount'),
    cell: (row: InvoiceRowType) => <AmountCell invoice={row.original} />,
  },
  {
    id: InvoiceColumns.Status,
    header: t('common:label.status', 'Status'),
    cell: (row: InvoiceRowType) => <InvoiceStatusCell invoice={row.original} />,
  },
  {
    id: InvoiceColumns.Expand,
    cell: (row: InvoiceRowType) => (
      <Button inset icon onPress={() => onViewInvoice(row.original)} aria-label={t('invoices:action.view_invoice', 'View invoice')} variant='ghost'>
        <ChevronRightFill />
      </Button>
    ),
  },
]

export interface InvoiceTableProps {
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

export const InvoiceTable = ({
  data,
  isLoading,
  isError,
  paginationProps,
  onViewInvoice,
  onCreateInvoice,
  searchProps,
  slots,
}: InvoiceTableProps) => {
  const { t } = useTranslation()
  const { tableFilters, setTableFilters } = useInvoiceTableFilters()
  const { status: selectedInvoiceStatusOption } = tableFilters

  const options = useInvoiceStatusOptions()

  const selectedStatusOption = useMemo(
    () => options.find(o => o.value === selectedInvoiceStatusOption?.value) ?? options[0],
    [options, selectedInvoiceStatusOption?.value],
  )

  const SingleValue = useCallback(() => {
    const label = selectedStatusOption?.label
    return label ? t('invoices:label.status_with_label', 'Status: {{label}}', { label }) : t('common:label.status', 'Status')
  }, [selectedStatusOption?.label, t])

  const StatusFilter = useCallback(() => (
    <ComboBox
      className='Layer__InvoiceTable__StatusFilter'
      options={options}
      onSelectedValueChange={option => option && setTableFilters({ status: option })}
      selectedValue={selectedStatusOption}
      isSearchable={false}
      isClearable={false}
      placeholder={t('common:label.status', 'Status')}
      slots={{ SingleValue }}
      aria-label={t('invoices:label.status_filter', 'Status Filter')}
    />
  ),
  [SingleValue, options, selectedStatusOption, setTableFilters, t])

  const CreateInvoiceButton = useCallback(() => (
    <Button onPress={onCreateInvoice}>
      {t('invoices:action.create_invoice', 'Create Invoice')}
      <Plus size={16} />
    </Button>
  ),
  [t, onCreateInvoice])

  const columnConfig = useMemo(() => getColumnConfig(onViewInvoice, t), [onViewInvoice, t])

  return (
    <Container name='InvoiceTable'>
      <DataTableHeader
        name={t('invoices:label.invoices', 'Invoices')}
        slots={{
          HeaderActions: CreateInvoiceButton,
          HeaderFilters: StatusFilter,
        }}
        slotProps={{
          SearchField: {
            label: t('invoices:label.search_invoices', 'Search invoices'),
            className: 'Layer__InvoiceTable__SearchField',
            ...searchProps,
          },
        }}
      />
      <PaginatedTable
        ariaLabel={t('invoices:label.invoices', 'Invoices')}
        data={data}
        isLoading={isLoading}
        isError={isError}
        columnConfig={columnConfig}
        paginationProps={paginationProps}
        componentName={COMPONENT_NAME}
        slots={slots}
      />
    </Container>
  )
}
