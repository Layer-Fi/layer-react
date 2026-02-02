import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'
import { Loader } from '@components/Loader/Loader'

import './invoiceFormPaymentMethodsStep.scss'

type InvoiceFormPaymentMethodsStepProps = {
  form: InvoiceFormType
  isReadOnly: boolean
  isLoading?: boolean
  isError?: boolean
}

const CLASSNAME = 'Layer__InvoiceFormPaymentMethodsStep'

export const InvoiceFormPaymentMethodsStep = ({
  form,
  isReadOnly,
  isLoading = false,
  isError = false,
}: InvoiceFormPaymentMethodsStepProps) => {
  const showFormFields = !isLoading && !isError
  const isFieldsReadOnly = isReadOnly || isLoading || isError
  const showHint = isLoading || isError
  const hintProps = isError ? { status: 'error' as const } : { variant: 'subtle' as const }
  const hintText = isError
    ? 'Payment methods failed to load. Saving now will only update invoice details.'
    : 'Payment methods are loading. Saving now will only update invoice details.'

  return (
    <VStack className={CLASSNAME} gap='md'>
      <VStack gap='xs'>
        <Heading level={3} size='sm'>Payment Methods</Heading>
        <Span variant='subtle'>Select which payment methods to enable for this invoice</Span>
        {showHint && (
          <Span size='xs' {...hintProps}>
            {hintText}
          </Span>
        )}
      </VStack>

      {isLoading && (
        <VStack className={`${CLASSNAME}__State`} gap='xs' align='center'>
          <Loader />
          <Span variant='subtle'>Loading payment methods</Span>
        </VStack>
      )}

      {isError && (
        <VStack className={`${CLASSNAME}__State`} gap='xs'>
          <DataState
            status={DataStateStatus.failed}
            title='Failed to load payment methods'
            description='You can still save invoice details, but payment methods will not be updated.'
            inline
          />
        </VStack>
      )}

      {showFormFields && (
        <>
          <VStack gap='sm'>
            <form.AppField name='paymentMethods.enableACH'>
              {field => (
                <field.FormSwitchField
                  label='ACH Bank Transfer'
                  isReadOnly={isFieldsReadOnly}
                />
              )}
            </form.AppField>

            <form.AppField name='paymentMethods.enableCreditCard'>
              {field => (
                <field.FormSwitchField
                  label='Credit Card'
                  isReadOnly={isFieldsReadOnly}
                />
              )}
            </form.AppField>
          </VStack>

          <form.AppField name='paymentMethods.customPaymentInstructions'>
            {field => (
              <field.FormTextAreaField
                label='Custom Payment Instructions'
                isReadOnly={isFieldsReadOnly}
              />
            )}
          </form.AppField>
        </>
      )}
    </VStack>
  )
}
