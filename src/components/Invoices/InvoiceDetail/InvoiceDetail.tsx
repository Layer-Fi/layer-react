import { useCallback, useState } from 'react'
import { BaseDetailView } from '../../BaseDetailView/BaseDetailView'
import { InvoiceForm, type InvoiceFormMode } from '../InvoiceForm/InvoiceForm'
import { UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'
import { Heading } from '../../ui/Typography/Heading'
import type { Invoice } from '../../../features/invoices/invoiceSchemas'
import { HStack } from '../../ui/Stack/Stack'
import { DataPoint } from '../../DataPoint/DataPoint'
import { Span } from '../../ui/Typography/Text'
import { convertCentsToCurrency } from '../../../utils/format'
import { InvoiceStatusCell } from '../InvoiceStatusCell/InvoiceStatusCell'
import { Button } from '../../ui/Button/Button'
import { SquarePen } from 'lucide-react'

export type InvoiceDetailProps = InvoiceFormMode & {
  onSuccess?: (invoice: Invoice) => void
  onGoBack: () => void
}

export const InvoiceDetail = (props: InvoiceDetailProps) => {
  const { onSuccess, onGoBack, ...restProps } = props
  const [isReadOnly, setIsReadOnly] = useState(props.mode === UpsertInvoiceMode.Update)

  const Header = useCallback(() => {
    return <InvoiceDetailHeader isReadOnly={isReadOnly} setIsReadOnly={setIsReadOnly} {...restProps} />
  }, [isReadOnly, restProps])

  return (
    <BaseDetailView slots={{ Header }} name='Invoice Detail View' onGoBack={onGoBack}>
      {restProps.mode === UpsertInvoiceMode.Update && <InvoiceDetailSubHeader invoice={restProps.invoice} />}
      <InvoiceForm isReadOnly={isReadOnly} onSuccess={onSuccess} {...props} />
    </BaseDetailView>
  )
}

type InvoiceDetailHeaderProps = InvoiceFormMode & {
  isReadOnly: boolean
  setIsReadOnly: (isReadOnly: boolean) => void
}
const InvoiceDetailHeader = (props: InvoiceDetailHeaderProps) => {
  const { mode, isReadOnly, setIsReadOnly } = props

  if (mode === UpsertInvoiceMode.Create) {
    return (
      <HStack justify='space-between' align='center' fluid pie='md'>
        <Heading>Create Invoice</Heading>
        <Button>Review & Send</Button>
      </HStack>
    )
  }

  const invoice = props.invoice
  const { invoiceNumber } = invoice

  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading>{invoiceNumber ? `Invoice ${invoiceNumber}` : 'View Invoice'}</Heading>
      {isReadOnly
        ? (
          <Button onPress={() => { setIsReadOnly(false) }}>
            Edit Invoice
            <SquarePen size={14} />
          </Button>

        )
        : (
          <Button>
            Review & Resend
          </Button>
        )}
    </HStack>
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
