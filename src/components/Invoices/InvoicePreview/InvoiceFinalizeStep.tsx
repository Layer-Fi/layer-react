import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Invoice } from '@schemas/invoices/invoice'
import { useInvoicePaymentMethods } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/useInvoicePaymentMethods'
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

import './invoiceFinalizeStep.scss'

type InvoiceFinalizeStepProps = {
  onSuccess: (invoice: Invoice) => void
}

export const InvoiceFinalizeStep = ({
  onSuccess,
}: InvoiceFinalizeStepProps) => {
  const { t } = useTranslation()
  const { invoice } = useInvoicePreviewRoute()
  const { data, isLoading, isError } = useInvoicePaymentMethods({ invoiceId: invoice.id })
  const paymentMethodsData = data?.data

  return (
    <HStack className='Layer__InvoiceFinalizeStep'>
      <VStack className='Layer__InvoiceFinalizeStep__PreviewPanel' fluid>
        <InvoicePreview />
      </VStack>
      <VStack className='Layer__InvoiceFinalizeStep__PaymentMethodsPanel' fluid>
        <ConditionalBlock
          data={paymentMethodsData}
          isLoading={isLoading}
          isError={isError}
          Loading={(
            <VStack className='Layer__InvoiceFinalizeStep__PaymentMethodsPanelLoading' justify='center' align='center' fluid>
              <Loader />
            </VStack>
          )}
          Error={(
            <VStack className='Layer__InvoiceFinalizeStep__PaymentMethodsPanelError'>
              <DataState
                icon={<AlertTriangle size={16} />}
                status={DataStateStatus.failed}
                title={t('invoices:error.load_payment_methods', 'We couldn\'t load payment methods')}
                description={t('common:error.please_try_again', 'Please try again.')}
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
