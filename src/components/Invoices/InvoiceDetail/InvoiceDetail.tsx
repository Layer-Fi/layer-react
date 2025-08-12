import { useCallback, useRef, useState } from 'react'
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
import type { InvoiceFormState } from '../InvoiceForm/formUtils'
import { useLayerContext } from '../../../contexts/LayerContext/LayerContext'

export type InvoiceDetailProps = InvoiceFormMode & {
  onGoBack: () => void
}

export const InvoiceDetail = (props: InvoiceDetailProps) => {
  const { onGoBack, ...invoiceProps } = props
  const { addToast } = useLayerContext()
  const formRef = useRef<{ submit: () => Promise<void> }>(null)

  const [invoiceState, setInvoiceState] = useState(invoiceProps)
  const [isReadOnly, setIsReadOnly] = useState(props.mode === UpsertInvoiceMode.Update)

  const onSuccess = useCallback((invoice: Invoice) => {
    const toastContent = invoiceState.mode === UpsertInvoiceMode.Update
      ? 'Invoice updated successfully'
      : 'Invoice created successfully'
    addToast({ content: toastContent, type: 'success' })

    setInvoiceState({ mode: UpsertInvoiceMode.Update, invoice })
    setIsReadOnly(true)
  }, [invoiceState.mode, addToast])

  const onSubmit = useCallback(() => void formRef.current?.submit(), [])
  const [formState, setFormState] = useState<InvoiceFormState>({
    isFormValid: true,
    isSubmitting: false,
    submitError: undefined,
  })

  const onChangeFormState = useCallback((nextState: InvoiceFormState) => {
    setFormState(nextState)
  }, [])

  const Header = useCallback(() => {
    return (
      <InvoiceDetailHeader
        onSubmit={onSubmit}
        isReadOnly={isReadOnly}
        formState={formState}
        setIsReadOnly={setIsReadOnly}
        {...invoiceState}
      />
    )
  }, [onSubmit, isReadOnly, formState, invoiceState])

  return (
    <BaseDetailView slots={{ Header }} name='Invoice Detail View' onGoBack={onGoBack}>
      {invoiceState.mode === UpsertInvoiceMode.Update && <InvoiceDetailSubHeader invoice={invoiceState.invoice} />}
      <InvoiceForm
        isReadOnly={isReadOnly}
        onSuccess={onSuccess}
        onChangeFormState={onChangeFormState}
        {...invoiceState}
        ref={formRef}
      />
    </BaseDetailView>
  )
}

type InvoiceDetailHeaderProps = InvoiceFormMode & {
  onSubmit: () => void
  isReadOnly: boolean
  formState: InvoiceFormState
  setIsReadOnly: (isReadOnly: boolean) => void
}
const InvoiceDetailHeader = (props: InvoiceDetailHeaderProps) => {
  const { mode, onSubmit, formState, isReadOnly, setIsReadOnly } = props
  const { isSubmitting } = formState

  if (mode === UpsertInvoiceMode.Create) {
    return (
      <HStack justify='space-between' align='center' fluid pie='md'>
        <Heading>Create Invoice</Heading>
        <Button isPending={isSubmitting} onPress={onSubmit}>Review & Send</Button>
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
          <Button isPending={isSubmitting} onPress={onSubmit}>Review & Resend</Button>
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
