import { useCallback, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/features/invoices/invoice'
import { InvoiceStatus } from '@schemas/features/invoices/invoiceStatus'
import { getCustomerName } from '@utils/features/customerVendor/customer'
import { unsafeAssertUnreachable } from '@utils/shared/switch/assertUnreachable'
import ChevronRightFill from '@icons/ChevronRightFill'
import { useDebouncedSearchProps } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { type TablePaginationProps } from '@hooks/utils/pagination/types'
import { useInvoiceTableFilters } from '@providers/features/invoices/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Container } from '@blocks/Layout/Container/Container'
import { DataTableHeader } from '@blocks/Table/DataTable/DataTableHeader'
import type { ColumnConfig } from '@blocks/Table/DataTable/utils/column'
import { PaginatedTable } from '@blocks/Table/PaginatedDataTable/PaginatedDataTable'
import { InvoiceStatusCell } from '@features/invoices/InvoiceStatusCell/InvoiceStatusCell'
import { useInvoiceStatusOptions } from '@features/invoices/utils'

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
  const outstandingBalanceLabel = t('invoices:InvoiceTable.label.amount_outstanding', '{{amount}} outstanding', { amount: outstandingBalance })

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
): ColumnConfig<Invoice> => [
  {
    id: InvoiceColumns.SentAt,
    header: t('invoices:InvoiceTable.label.created_date', 'Created Date'),
    cell: (row: InvoiceRowType) => <DateCell date={row.original.sentAt} />,
  },
  {
    id: InvoiceColumns.InvoiceNo,
    header: t('invoices:InvoiceTable.label.number_abbreviation', 'No.'),
    cell: (row: InvoiceRowType) => <Span ellipsis>{row.original.invoiceNumber}</Span>,
    isRowHeader: true,
  },
  {
    id: InvoiceColumns.Customer,
    header: t('invoices:InvoiceTable.label.customer', 'Customer'),
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
      <Button inset icon onPress={() => onViewInvoice(row.original)} aria-label={t('invoices:InvoiceTable.action.view_invoice', 'View invoice')} variant='ghost'>
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
  slots,
}: InvoiceTableProps) => {
  const { t } = useTranslation()
  const { tableFilters, setTableFilters } = useInvoiceTableFilters()
  const { status: selectedInvoiceStatusOption } = tableFilters

  const searchProps = useDebouncedSearchProps({ query: tableFilters.query, setTableFilters })

  const options = useInvoiceStatusOptions()

  const selectedStatusOption = useMemo(
    () => options.find(o => o.value === selectedInvoiceStatusOption?.value) ?? options[0] ?? null,
    [options, selectedInvoiceStatusOption?.value],
  )

  const SingleValue = useCallback(() => {
    const label = selectedStatusOption?.label
    return label ? t('invoices:InvoiceTable.label.status_with_label', 'Status: {{label}}', { label }) : t('common:label.status', 'Status')
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
      aria-label={t('invoices:InvoiceTable.label.status_filter', 'Status Filter')}
    />
  ),
  [SingleValue, options, selectedStatusOption, setTableFilters, t])

  const CreateInvoiceButton = useCallback(() => (
    <Button onPress={onCreateInvoice}>
      {t('invoices:InvoiceTable.action.create_invoice', 'Create Invoice')}
      <Plus size={16} />
    </Button>
  ),
  [t, onCreateInvoice])

  const columnConfig = useMemo(() => getColumnConfig(onViewInvoice, t), [onViewInvoice, t])

  return (
    <Container name='InvoiceTable'>
      <DataTableHeader
        name={t('invoices:InvoiceTable.label.invoices', 'Invoices')}
        slots={{
          HeaderActions: CreateInvoiceButton,
          HeaderFilters: StatusFilter,
        }}
        slotProps={{
          SearchField: {
            label: t('invoices:InvoiceTable.label.search_invoices', 'Search invoices'),
            className: 'Layer__InvoiceTable__SearchField',
            ...searchProps,
          },
        }}
      />
      <PaginatedTable
        ariaLabel={t('invoices:InvoiceTable.label.invoices', 'Invoices')}
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
