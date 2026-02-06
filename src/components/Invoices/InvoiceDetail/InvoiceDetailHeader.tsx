import { useCallback, useMemo } from 'react'
import { ArrowRight, HandCoins, Send } from 'lucide-react'

import type { Awaitable } from '@internal-types/utility/promises'
import { type InvoiceDetailRouteState, InvoiceDetailStep, useInvoiceDetail, useInvoiceNavigation } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { InvoiceDetailHeaderMenu } from '@components/Invoices/InvoiceDetail/InvoiceDetailHeaderMenu'
import type { InvoiceFormState } from '@components/Invoices/InvoiceForm/formUtils'
import { UpsertInvoiceMode } from '@features/invoices/api/useUpsertInvoice'
import { InvoiceStatus } from '@features/invoices/invoiceSchemas'

import './invoiceDetailHeader.scss'

enum HeaderMode {
  View = 'View',
  Edit = 'Edit',
  Preview = 'Preview',
}

const getHeaderMode = (viewState: InvoiceDetailRouteState): HeaderMode => {
  if (viewState.step === InvoiceDetailStep.Preview) {
    return HeaderMode.Preview
  }
  if (viewState.isReadOnly) {
    return HeaderMode.View
  }
  return HeaderMode.Edit
}

const getHeadingContent = (headerMode: HeaderMode, invoiceNumber: string | null) => {
  switch (headerMode) {
    case HeaderMode.Preview:
      return invoiceNumber ? `Previewing Invoice #${invoiceNumber}` : 'Previewing Invoice'
    case HeaderMode.View:
      return invoiceNumber ? `Invoice #${invoiceNumber}` : 'View Invoice'
    case HeaderMode.Edit:
      return invoiceNumber ? `Editing Invoice #${invoiceNumber}` : 'Editing Invoice'
  }
}

export type InvoiceDetailHeaderProps = {
  onSubmitInvoiceForm: () => Awaitable<void>
  formState: InvoiceFormState
  openInvoicePaymentDrawer: () => void
}

export const InvoiceDetailHeader = ({
  onSubmitInvoiceForm,
  formState,
  openInvoicePaymentDrawer,
}: InvoiceDetailHeaderProps) => {
  const viewState = useInvoiceDetail()
  const { toEditInvoice } = useInvoiceNavigation()

  const onPressNext = useCallback(() => {
    void onSubmitInvoiceForm()
  }, [onSubmitInvoiceForm])

  const previewButton = useMemo(() => (
    <Button isDisabled={formState.isSubmitting} onPress={onPressNext}>
      Next
      <ArrowRight size={14} />
    </Button>
  ), [formState.isSubmitting, onPressNext])

  if (viewState.mode === UpsertInvoiceMode.Create) {
    return (
      <HStack justify='space-between' align='center' fluid pie='md'>
        <Heading>Create Invoice</Heading>
        {previewButton}
      </HStack>
    )
  }

  const headerMode = getHeaderMode(viewState)
  const headingContent = getHeadingContent(headerMode, viewState.invoice.invoiceNumber)

  const canMarkAsPaid = viewState.invoice.status === InvoiceStatus.Sent
    || viewState.invoice.status === InvoiceStatus.PartiallyPaid

  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading className='Layer__InvoiceDetail__Heading' ellipsis>{headingContent}</Heading>
      {headerMode === HeaderMode.Preview && (
        <Button>
          Save and Send
          <Send size={14} />
        </Button>
      )}
      {headerMode === HeaderMode.Edit && previewButton}
      {headerMode === HeaderMode.View && (
        <HStack gap='xs'>
          {canMarkAsPaid && (
            <Button onPress={openInvoicePaymentDrawer}>
              Mark as paid
              <HandCoins size={14} />
            </Button>
          )}
          <InvoiceDetailHeaderMenu onEditInvoice={() => toEditInvoice(viewState.invoice)} />
        </HStack>
      )}
    </HStack>
  )
}
