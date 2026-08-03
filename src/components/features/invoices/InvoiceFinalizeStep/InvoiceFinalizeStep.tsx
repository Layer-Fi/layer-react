import classNames from 'classnames'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Invoice } from '@schemas/invoices/invoice'
import { useGetInvoicePaymentMethods } from '@api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/get'
import {
  useInvoicePreviewRoute,
} from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Loader } from '@ui/Loader/Loader'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import {
  InvoiceFinalizeForm,
} from '@features/invoices/InvoiceFinalizeForm/InvoiceFinalizeForm'
import { InvoicePreview } from '@features/invoices/InvoicePreview/InvoicePreview'

import './invoiceFinalizeStep.scss'

type InvoiceFinalizeStepProps = {
  onSuccess: (invoice: Invoice) => void
}

export const InvoiceFinalizeStep = ({ onSuccess }: InvoiceFinalizeStepProps) => {
  const { t } = useTranslation()
  const { accountingConfiguration } = useLayerContext()
  const { invoice } = useInvoicePreviewRoute()
  const showPaymentMethods = !!accountingConfiguration?.enableStripeOnboarding
  const { data, isLoading, isError } = useGetInvoicePaymentMethods({
    invoiceId: invoice.id,
    isEnabled: showPaymentMethods,
  })
  const paymentMethodsData = data?.data

  return (
    <HStack className={classNames('Layer__InvoiceFinalizeStep', !showPaymentMethods && 'Layer__InvoiceFinalizeStep--previewOnly')}>
      <VStack className={classNames('Layer__InvoiceFinalizeStep__PreviewPanel', !showPaymentMethods && 'Layer__InvoiceFinalizeStep__PreviewPanel--previewOnly')} fluid>
        <InvoicePreview />
      </VStack>
      {showPaymentMethods && (
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
      )}
    </HStack>
  )
}
