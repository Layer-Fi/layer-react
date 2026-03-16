import { useCallback, useMemo } from 'react'
import { useStore } from '@tanstack/react-form'
import { Save } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'

import type { Invoice } from '@schemas/invoices/invoice'
import type { InvoicePaymentMethod } from '@schemas/invoices/invoicePaymentMethod'
import { flattenValidationErrors } from '@utils/form'
import CreditCardIcon from '@icons/CreditCard'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { FormErrorBanner } from '@components/FormErrorBanner/FormErrorBanner'
import {
  useInvoiceFinalizeForm,
} from '@components/Invoices/InvoicePreview/InvoiceFinalizeForm/useInvoiceFinalizeForm'

import './invoiceFinalizeForm.scss'

type InvoiceFinalizeFormProps = {
  invoice: Invoice
  initialPaymentMethods: readonly InvoicePaymentMethod[]
  onSuccess: (invoice: Invoice) => void
}

export const InvoiceFinalizeForm = ({
  invoice,
  initialPaymentMethods,
  onSuccess,
}: InvoiceFinalizeFormProps) => {
  const { t } = useTranslation()
  const { form, submitError } = useInvoiceFinalizeForm({
    invoice,
    initialPaymentMethods,
    onSuccess,
  })
  const errorMap = useStore(form.store, state => state.errorMap)
  const validationErrors = useMemo(() => flattenValidationErrors(errorMap), [errorMap])
  const topError = validationErrors[0] || submitError

  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className='Layer__InvoiceFinalizeForm' onSubmit={blockNativeOnSubmit}>
      {topError ? <FormErrorBanner message={topError} className='Layer__InvoiceFinalizeForm__ErrorBanner' /> : null}
      <VStack className='Layer__InvoiceFinalizeForm__Section' gap='sm'>
        <Heading level={3} size='sm'>{t('invoices.paymentMethods', 'Payment methods')}</Heading>
        <form.AppField name='creditCardEnabled'>
          {field => (
            <field.FormSwitchField
              label={t('common.creditCard', 'Credit Card')}
              slots={{ LabelIcon: <CreditCardIcon size={14} /> }}
              inline
            />
          )}
        </form.AppField>
      </VStack>
      <VStack className='Layer__InvoiceFinalizeForm__Section' gap='sm'>
        <Heading level={3} size='sm'>{t('invoices.customPaymentInstructions', 'Custom Payment Instructions')}</Heading>
        <form.AppField name='customPaymentInstructions'>
          {field => (
            <field.FormTextAreaField
              label={t('invoices.customPaymentInstructions', 'Custom Payment Instructions')}
              showLabel={false}
              className='Layer__InvoiceFinalizeForm__Field__CustomPaymentInstructions'
              placeholder={t('invoices.addCustomPaymentInstructions', 'Add custom payment instructions')}
            />
          )}
        </form.AppField>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <HStack className='Layer__InvoiceFinalizeForm__Submit' justify='end'>
              <Button type='submit' isDisabled={!canSubmit} isPending={isSubmitting} onPress={() => { void form.handleSubmit() }}>
                {t('common.save', 'Save')}
                <Save size={14} />
              </Button>
            </HStack>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
