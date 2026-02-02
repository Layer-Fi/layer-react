import { useCallback, useMemo } from 'react'
import { ChevronRight, HandCoins, Save, Send } from 'lucide-react'

import type { Awaitable } from '@internal-types/utility/promises'
import { useInvoiceDetail } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useInvoicesContext } from '@contexts/InvoicesContext/InvoicesContext'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { InvoiceDetailHeaderMenu } from '@components/Invoices/InvoiceDetail/InvoiceDetailHeaderMenu'
import type { InvoiceFormState } from '@components/Invoices/InvoiceForm/formUtils'
import { UpsertInvoiceMode } from '@features/invoices/api/useUpsertInvoice'
import { InvoiceFormStep, InvoiceStatus } from '@features/invoices/invoiceSchemas'

import './invoiceDetailHeader.scss'

export type InvoiceDetailHeaderProps = {
  onSubmit: ({ submitAction }: { submitAction: 'send' | null }) => Awaitable<void>
  isReadOnly: boolean
  formState: InvoiceFormState
  setIsReadOnly: (isReadOnly: boolean) => void
  openInvoicePaymentDrawer: () => void
  currentStep: InvoiceFormStep
  onNextStep: () => void
}

export const InvoiceDetailHeader = ({
  onSubmit,
  formState,
  isReadOnly,
  setIsReadOnly,
  openInvoicePaymentDrawer,
  currentStep,
  onNextStep: onNextStep,
}: InvoiceDetailHeaderProps) => {
  const viewState = useInvoiceDetail()
  const { onSendInvoice } = useInvoicesContext()
  const { isSubmitting } = formState

  const onEditInvoice = useCallback(() => {
    setIsReadOnly(false)
  }, [setIsReadOnly])

  const onPressSave = useCallback(() => {
    void onSubmit({ submitAction: null })
  }, [onSubmit])

  const onPressSend = useCallback(() => {
    void onSubmit({ submitAction: 'send' })
  }, [onSubmit])

  const actionButtons = useMemo(() => {
    if (currentStep === InvoiceFormStep.Details) {
      return (
        <HStack gap='xs'>
          <Button isDisabled={isSubmitting} onPress={onNextStep}>
            Next
            <ChevronRight size={14} />
          </Button>
        </HStack>
      )
    }

    return (
      <HStack gap='xs'>
        <Button variant={onSendInvoice ? 'outlined' : 'solid'} isDisabled={isSubmitting} onPress={onPressSave}>
          Save
          <Save size={14} />
        </Button>
        {onSendInvoice && (
          <Button isDisabled={isSubmitting} onPress={onPressSend}>
            Save and Send
            <Send size={14} />
          </Button>
        )}
      </HStack>
    )
  }, [isSubmitting, onPressSave, onPressSend, onSendInvoice, currentStep, onNextStep])

  if (viewState.mode === UpsertInvoiceMode.Create) {
    return (
      <HStack justify='space-between' align='center' fluid pie='md'>
        <Heading>Create Invoice</Heading>
        {actionButtons}
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
        : actionButtons}
    </HStack>
  )
}
