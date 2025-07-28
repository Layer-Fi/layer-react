import { useCallback } from 'react'
import { BaseDetailView } from '../../BaseDetailView/BaseDetailView'
import { InvoiceForm, type InvoiceFormMode, type InvoiceFormProps } from '../InvoiceForm/InvoiceForm'
import { UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'
import { Heading } from '../../ui/Typography/Heading'
import type { Invoice } from '../../../features/invoices/invoiceSchemas'
import { HStack } from '../../ui/Stack/Stack'
import { DataPoint } from '../../DataPoint/DataPoint'
import { Span } from '../../ui/Typography/Text'
import { convertCentsToCurrency } from '../../../utils/format'
import { InvoiceStatusCell } from '../InvoiceStatusCell/InvoiceStatusCell'

export type InvoiceDetailProps = InvoiceFormProps & {
  onGoBack: () => void
}

export const InvoiceDetail = (props: InvoiceDetailProps) => {
  const { onSuccess: _onSuccess, onGoBack, ...restProps } = props

  const Header = useCallback(() => {
    return <InvoiceDetailHeader {...restProps} />
  }, [restProps])

  return (
    <BaseDetailView slots={{ Header }} name='Invoice Detail View' onGoBack={onGoBack}>
      {restProps.mode === UpsertInvoiceMode.Update && <InvoiceDetailSubHeader invoice={restProps.invoice} />}
      <InvoiceForm {...props} />
    </BaseDetailView>
  )
}

type InvoiceDetailHeaderProps = InvoiceFormMode
const InvoiceDetailHeader = (props: InvoiceDetailHeaderProps) => {
  const { mode } = props

  if (mode === UpsertInvoiceMode.Create) {
    return <Heading>Create Invoice</Heading>
  }

  const invoice = props.invoice
  const { invoiceNumber } = invoice

  return (
    <Heading>{invoiceNumber ? `Invoice ${invoiceNumber}` : 'View Invoice'}</Heading>
  )
}

type InvoiceDetailSubHeaderProps = {
  invoice: Invoice
}

const InvoiceDetailSubHeader = ({ invoice }: InvoiceDetailSubHeaderProps) => {
  const { outstandingBalance, totalAmount } = invoice

  return (
    <HStack className='Layer__InvoiceDetail__SubHeader'>
      <HStack gap='5xl'>
        <DataPoint label='Balance due'>
          <Span>{convertCentsToCurrency(outstandingBalance)}</Span>
        </DataPoint>
        <DataPoint label='Open balance'>
          <Span>{convertCentsToCurrency(totalAmount)}</Span>
        </DataPoint>
        <DataPoint label='Status'>
          <InvoiceStatusCell invoice={invoice} inline />
        </DataPoint>
      </HStack>
    </HStack>
  )
}
