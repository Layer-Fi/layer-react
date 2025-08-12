import { useCallback, useRef, useState } from 'react'
import { BaseDetailView } from '../../BaseDetailView/BaseDetailView'
import { InvoiceForm } from '../InvoiceForm/InvoiceForm'
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
import { useInvoiceNavigation, useInvoiceDetail } from '../../../providers/InvoicesProvider/InvoicesProvider'

export const InvoiceDetail = () => {
  const viewState = useInvoiceDetail()
  const { toViewInvoice, toInvoiceTable } = useInvoiceNavigation()
  const { addToast } = useLayerContext()
  const formRef = useRef<{ submit: () => Promise<void> }>(null)

  const [isReadOnly, setIsReadOnly] = useState(viewState.mode === UpsertInvoiceMode.Update)

  const onSuccess = useCallback((invoice: Invoice) => {
    const toastContent = viewState.mode === UpsertInvoiceMode.Update
      ? 'Invoice updated successfully'
      : 'Invoice created successfully'
    addToast({ content: toastContent, type: 'success' })

    toViewInvoice(invoice)
    setIsReadOnly(true)
  }, [viewState.mode, addToast, toViewInvoice])

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
      />
    )
  }, [onSubmit, isReadOnly, formState])

  return (
    <BaseDetailView slots={{ Header }} name='Invoice Detail View' onGoBack={toInvoiceTable}>
      {viewState.mode === UpsertInvoiceMode.Update && <InvoiceDetailSubHeader invoice={viewState.invoice} />}
      <InvoiceForm
        isReadOnly={isReadOnly}
        onSuccess={onSuccess}
        onChangeFormState={onChangeFormState}
        ref={formRef}
      />
    </BaseDetailView>
  )
}

type InvoiceDetailHeaderProps = {
  onSubmit: () => void
  isReadOnly: boolean
  formState: InvoiceFormState
  setIsReadOnly: (isReadOnly: boolean) => void
}
const InvoiceDetailHeader = ({ onSubmit, formState, isReadOnly, setIsReadOnly }: InvoiceDetailHeaderProps) => {
  const viewState = useInvoiceDetail()
  const { isSubmitting } = formState

  if (viewState.mode === UpsertInvoiceMode.Create) {
    return (
      <HStack justify='space-between' align='center' fluid pie='md'>
        <Heading>Create Invoice</Heading>
        <Button isPending={isSubmitting} onPress={onSubmit}>Review & Send</Button>
      </HStack>
    )
  }

  const invoiceNumber = viewState.invoice.invoiceNumber
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
