import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { FilingStatusComboBox } from '@components/TaxProfileForm/FilingStatusComboBox/FilingStatusComboBox'
import { type TaxProfileForm } from '@components/TaxProfileForm/taxProfileFormSchema'
import { UsStateComboBox } from '@components/UsStateComboBox/UsStateComboBox'
import { type AppForm } from '@features/forms/hooks/useForm'

type StateTaxSectionProps = {
  form: AppForm<TaxProfileForm>
  isReadOnly?: boolean
}

export const StateTaxSection = ({ form, isReadOnly }: StateTaxSectionProps) => {
  return (
    <VStack className='Layer__TaxProfileForm__Section' gap='md'>
      <Heading level={3}>State Tax Information</Heading>

      <form.Field name='usConfiguration.state.taxState'>
        {field => (
          <UsStateComboBox
            className='Layer__TaxProfileForm__Field'
            value={field.state.value ?? null}
            onChange={field.handleChange}
            isReadOnly={isReadOnly}
            inline
          />
        )}
      </form.Field>

      <form.Field name='usConfiguration.state.filingStatus'>
        {field => (
          <FilingStatusComboBox
            className='Layer__TaxProfileForm__Field'
            value={field.state.value ?? null}
            onChange={field.handleChange}
            isReadOnly={isReadOnly}
            inline
          />
        )}
      </form.Field>

      <form.AppField name='usConfiguration.state.withholding.useCustomWithholding'>
        {field => (
          <field.FormRadioGroupYesNoField
            className='Layer__TaxProfileForm__Field'
            label='Use custom withholding?'
            isReadOnly={isReadOnly}
            inline
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => state.values.usConfiguration?.state?.withholding?.useCustomWithholding}>
        {useCustomWithholding => useCustomWithholding && (
          <form.AppField name='usConfiguration.state.withholding.amount'>
            {field => (
              <field.FormBigDecimalField
                className='Layer__TaxProfileForm__Field'
                label='Withholding amount'
                mode='currency'
                inline
                isReadOnly={isReadOnly}
                placeholder='Enter amount'
              />
            )}
          </form.AppField>
        )}
      </form.Subscribe>
    </VStack>
  )
}
