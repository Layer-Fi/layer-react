import { AlertTriangle } from 'lucide-react'

import {
  useInvoicePreviewRoute,
} from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import {
  InvoiceFinalizeForm,
} from '@components/Invoices/InvoicePreview/InvoiceFinalizeForm/InvoiceFinalizeForm'
import { InvoicePreview } from '@components/Invoices/InvoicePreview/InvoicePreview'
import { Loader } from '@components/Loader/Loader'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { useInvoicePaymentMethods } from '@features/invoices/api/useInvoicePaymentMethods'
import type { Invoice } from '@features/invoices/invoiceSchemas'

import './invoiceFinalizeStep.scss'

type InvoiceFinalizeStepProps = {
  onSuccess: (invoice: Invoice) => void
}

export const InvoiceFinalizeStep = ({
  onSuccess,
}: InvoiceFinalizeStepProps) => {
  const { invoice } = useInvoicePreviewRoute()
  const { data, isLoading, isError } = useInvoicePaymentMethods({ invoiceId: invoice.id })

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
          Inactive={null}
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
            <InvoiceFinalizeForm
              invoice={invoice}
              initialPaymentMethods={invoicePaymentMethods.paymentMethods}
              onSuccess={onSuccess}
            />
          )}
        </ConditionalBlock>
      </VStack>
    </HStack>
  )
}
