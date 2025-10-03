import { useCallback, useMemo, useRef, useState } from 'react'
import { BaseDetailView } from '../../BaseDetailView/BaseDetailView'
import { InvoiceForm } from '../InvoiceForm/InvoiceForm'
import { UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'
import { Heading } from '../../ui/Typography/Heading'
import { InvoiceStatus, type Invoice } from '../../../features/invoices/invoiceSchemas'
import { type InvoicePayment } from '../../../features/invoices/invoicePaymentSchemas'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { DataPoint } from '../../DataPoint/DataPoint'
import { Span } from '../../ui/Typography/Text'
import { convertCentsToCurrency } from '../../../utils/format'
import { InvoiceStatusCell } from '../InvoiceStatusCell/InvoiceStatusCell'
import { Button } from '../../ui/Button/Button'
import { HandCoins, Save, Send } from 'lucide-react'
import type { InvoiceFormState } from '../InvoiceForm/formUtils'
import { useLayerContext } from '../../../contexts/LayerContext/LayerContext'
import { useInvoiceNavigation, useInvoiceDetail } from '../../../providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Drawer } from '../../ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '../../ui/Modal/ModalSlots'
import { InvoicePaymentForm } from '../InvoicePaymentForm/InvoicePaymentForm'
import { updateInvoiceWithPayment, UpsertDedicatedInvoicePaymentMode } from '../../../features/invoices/api/useUpsertDedicatedInvoicePayment'
import X from '../../../icons/X'
import BackArrow from '../../../icons/BackArrow'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { InvoiceDetailHeaderMenu } from './InvoiceDetailHeaderMenu'
import type { Awaitable } from '../../../types/utility/promises'
import { useInvoicesContext } from '../../../contexts/InvoicesContext/InvoicesContext'

export const InvoiceDetail = () => {
  const viewState = useInvoiceDetail()
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false)
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false)
  const { toViewInvoice, toInvoiceTable } = useInvoiceNavigation()
  const { addToast } = useLayerContext()
  const formRef = useRef<{ submit: ({ submitAction }: { submitAction: 'send' | null }) => Promise<void> }>(null)

  const [isReadOnly, setIsReadOnly] = useState(viewState.mode === UpsertInvoiceMode.Update)

  const onUpsertInvoiceSuccess = useCallback((invoice: Invoice) => {
    const toastContent = viewState.mode === UpsertInvoiceMode.Update
      ? 'Invoice updated successfully'
      : 'Invoice created successfully'
    addToast({ content: toastContent, type: 'success' })

    toViewInvoice(invoice)
    setIsReadOnly(true)
  }, [viewState.mode, addToast, toViewInvoice])

  const onUpsertInvoicePaymentSuccess = useCallback((invoice: Invoice, invoicePayment: InvoicePayment) => {
    addToast({ content: 'Invoice paid successfully', type: 'success' })
    const updatedInvoice = updateInvoiceWithPayment(invoice, invoicePayment)

    toViewInvoice(updatedInvoice)
  }, [addToast, toViewInvoice])

  const onSubmit = useCallback(({ submitAction }: { submitAction: 'send' | null }) => formRef.current?.submit({ submitAction }), [])
  const [formState, setFormState] = useState<InvoiceFormState>({
    isDirty: false,
    isSubmitting: false,
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
        openInvoicePaymentDrawer={() => setIsPaymentDrawerOpen(true)}
      />
    )
  }, [onSubmit, isReadOnly, formState])

  const hasChanges = !isReadOnly && formState.isDirty
  const onGoBack = useCallback(() => {
    if (hasChanges) {
      setIsDiscardChangesModalOpen(true)
    }
    else {
      toInvoiceTable()
    }
  }, [hasChanges, toInvoiceTable])

  return (
    <>
      <BaseDetailView slots={{ Header, BackIcon: hasChanges ? X : BackArrow }} name='InvoiceDetail' onGoBack={onGoBack}>
        {viewState.mode === UpsertInvoiceMode.Update && <InvoiceDetailSubHeader invoice={viewState.invoice} />}
        <InvoiceForm
          isReadOnly={isReadOnly}
          onSuccess={onUpsertInvoiceSuccess}
          onChangeFormState={onChangeFormState}
          ref={formRef}
        />
      </BaseDetailView>
      <BaseConfirmationModal
        isOpen={isDiscardChangesModalOpen}
        onOpenChange={setIsDiscardChangesModalOpen}
        title='Discard changes to this invoice?'
        description='Any unsaved changes will be lost.'
        onConfirm={toInvoiceTable}
        confirmLabel='Discard changes'
        cancelLabel='Keep editing'
      />
      {viewState.mode === UpsertInvoiceMode.Update && (
        <Drawer isOpen={isPaymentDrawerOpen} onOpenChange={setIsPaymentDrawerOpen}>
          {({ close }) => (
            <VStack pb='lg' gap='lg'>
              <VStack pi='md'>
                <ModalTitleWithClose
                  heading={(
                    <ModalHeading size='lg'>
                      Record invoice payment
                    </ModalHeading>
                  )}
                  onClose={close}
                />
              </VStack>
              <InvoicePaymentForm
                onSuccess={(invoicePayment: InvoicePayment) => {
                  onUpsertInvoicePaymentSuccess(viewState.invoice, invoicePayment)
                  close()
                }}
                mode={UpsertDedicatedInvoicePaymentMode.Create}
                invoice={viewState.invoice}
              />
            </VStack>
          )}
        </Drawer>
      )}
    </>
  )
}

type InvoiceDetailHeaderProps = {
  onSubmit: ({ submitAction }: { submitAction: 'send' | null }) => Awaitable<void>
  isReadOnly: boolean
  formState: InvoiceFormState
  setIsReadOnly: (isReadOnly: boolean) => void
  openInvoicePaymentDrawer: () => void
}
const InvoiceDetailHeader = ({ onSubmit, formState, isReadOnly, setIsReadOnly, openInvoicePaymentDrawer }: InvoiceDetailHeaderProps) => {
  const viewState = useInvoiceDetail()
  const { onSendInvoice } = useInvoicesContext()
  const { isSubmitting } = formState

  const onEditInvoice = useCallback(() => {
    setIsReadOnly(false)
  }, [setIsReadOnly])

  const onPressSave = useCallback(() => {
    void onSubmit({ submitAction: null })
  }, [onSubmit])

  const saveButton = useMemo(() => (
    <Button variant={onSendInvoice ? 'outlined' : 'solid'} isDisabled={isSubmitting} onPress={onPressSave}>
      Save
      <Save size={14} />
    </Button>
  ), [isSubmitting, onPressSave, onSendInvoice])

  const onPressSend = useCallback(() => {
    void onSubmit({ submitAction: 'send' })
  }, [onSubmit])

  const sendButton = useMemo(() => {
    if (!onSendInvoice) return null
    return (
      <Button isDisabled={isSubmitting} onPress={onPressSend}>
        Save and Send
        <Send size={14} />
      </Button>
    )
  }, [isSubmitting, onPressSend, onSendInvoice])

  const saveAndSendButtons = useMemo(() => (
    <HStack gap='xs'>
      {saveButton}
      {sendButton}
    </HStack>
  ), [saveButton, sendButton])

  if (viewState.mode === UpsertInvoiceMode.Create) {
    return (
      <HStack justify='space-between' align='center' fluid pie='md'>
        <Heading>Create Invoice</Heading>
        {saveAndSendButtons}
      </HStack>
    )
  }

  const invoiceNumber = viewState.invoice.invoiceNumber

  const headingContent = isReadOnly
    ? (invoiceNumber ? `Invoice #${invoiceNumber}` : 'View Invoice')
    : invoiceNumber ? `Editing Invoice #${invoiceNumber}` : 'Editing Invoice'

  const canMarkAsPaid = viewState.mode === UpsertInvoiceMode.Update
    && (viewState.invoice.status === InvoiceStatus.Sent || viewState.invoice.status === InvoiceStatus.PartiallyPaid)

  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading className='Layer__InvoiceDetail__Heading' ellipsis>{headingContent}</Heading>
      {isReadOnly
        ? (
          <HStack gap='xs'>
            {canMarkAsPaid && (
              <Button onPress={openInvoicePaymentDrawer}>
                Mark as paid
                <HandCoins size={14} />
              </Button>
            )}
            <InvoiceDetailHeaderMenu onEditInvoice={onEditInvoice} />
          </HStack>
        )
        : saveAndSendButtons}
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
