import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'

import './invoiceFormPaymentMethodsStep.scss'

type InvoiceFormPaymentMethodsStepProps = {
  form: InvoiceFormType
  isReadOnly: boolean
}

const CLASSNAME = 'Layer__InvoiceFormPaymentMethodsStep'

export const InvoiceFormPaymentMethodsStep = ({
  form,
  isReadOnly,
}: InvoiceFormPaymentMethodsStepProps) => {
  return (
    <VStack className={CLASSNAME} gap='md'>
      <VStack gap='xs'>
        <Heading level={3} size='sm'>Payment Methods</Heading>
        <Span variant='subtle'>Select which payment methods to enable for this invoice</Span>
      </VStack>

      <VStack gap='sm'>
        <form.AppField name='paymentMethods.enableACH'>
          {field => (
            <field.FormSwitchField
              label='ACH Bank Transfer'
              isReadOnly={isReadOnly}
            />
          )}
        </form.AppField>

        <form.AppField name='paymentMethods.enableCreditCard'>
          {field => (
            <field.FormSwitchField
              label='Credit Card'
              isReadOnly={isReadOnly}
            />
          )}
        </form.AppField>
      </VStack>

      <form.AppField name='paymentMethods.customPaymentInstructions'>
        {field => (
          <field.FormTextAreaField
            label='Custom Payment Instructions'
            isReadOnly={isReadOnly}
          />
        )}
      </form.AppField>
    </VStack>
  )
}
