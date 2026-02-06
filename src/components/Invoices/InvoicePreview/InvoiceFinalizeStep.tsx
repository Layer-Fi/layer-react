import { forwardRef } from 'react'
import { AlertTriangle } from 'lucide-react'

import {
  InvoiceDetailStep,
  useInvoiceDetail,
} from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import {
  InvoiceFinalizeForm,
  type InvoiceFinalizeFormRef,
} from '@components/Invoices/InvoicePreview/InvoiceFinalizeForm/InvoiceFinalizeForm'
import type { InvoiceFinalizeFormState } from '@components/Invoices/InvoicePreview/InvoiceFinalizeForm/useInvoiceFinalizeForm'
import { InvoicePreview } from '@components/Invoices/InvoicePreview/InvoicePreview'
import { Loader } from '@components/Loader/Loader'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { useInvoicePaymentMethods } from '@features/invoices/api/useInvoicePaymentMethods'
import type { InvoicePaymentMethod } from '@features/invoices/invoicePaymentMethodSchemas'
import type { Invoice } from '@features/invoices/invoiceSchemas'

import './invoiceFinalizeStep.scss'

export type InvoiceFinalizeStepRef = InvoiceFinalizeFormRef

type InvoiceFinalizeStepProps = {
  onSuccess: (invoice: Invoice) => void
  onChangeFormState?: (formState: InvoiceFinalizeFormState) => void
}

export const InvoiceFinalizeStep = forwardRef<
  InvoiceFinalizeStepRef,
  InvoiceFinalizeStepProps
>(({
  onSuccess,
  onChangeFormState,
}, ref) => {
  const viewState = useInvoiceDetail()
  const invoiceId = viewState.step === InvoiceDetailStep.Preview
    ? viewState.invoice.id
    : ''
  const { data, isLoading, isError } = useInvoicePaymentMethods({ invoiceId })

  if (viewState.step !== InvoiceDetailStep.Preview) {
    return null
  }

  const { invoice } = viewState

  const renderFinalizeForm = (initialPaymentMethods: readonly InvoicePaymentMethod[]) => (
    <InvoiceFinalizeForm
      ref={ref}
      invoice={invoice}
      initialPaymentMethods={initialPaymentMethods}
      onSuccess={onSuccess}
      onChangeFormState={onChangeFormState}
    />
  )

  return (
    <HStack className='Layer__InvoiceFinalizeStep'>
      <VStack className='Layer__InvoiceFinalizeStep__PreviewPanel' fluid>
        <InvoicePreview />
      </VStack>
      <VStack className='Layer__InvoiceFinalizeStep__PaymentMethodsPanel' fluid>
        <ConditionalBlock
          data={data?.data}
          isLoading={isLoading}
          isError={isError}
          Loading={(
            <VStack className='Layer__InvoiceFinalizeStep__PaymentMethodsPanelLoading' justify='center' align='center' fluid>
              <Loader />
            </VStack>
          )}
          Inactive={renderFinalizeForm([])}
          Error={(
            <VStack className='Layer__InvoiceFinalizeStep__PaymentMethodsPanelError'>
              <DataState
                icon={<AlertTriangle size={16} />}
                status={DataStateStatus.failed}
                title="We couldn't load payment methods"
                description='Please try again.'
              />
            </VStack>
          )}
        >
          {({ data: invoicePaymentMethods }) => (
            renderFinalizeForm(invoicePaymentMethods.paymentMethods)
          )}
        </ConditionalBlock>
      </VStack>
    </HStack>
  )
})

InvoiceFinalizeStep.displayName = 'InvoiceFinalizeStep'
