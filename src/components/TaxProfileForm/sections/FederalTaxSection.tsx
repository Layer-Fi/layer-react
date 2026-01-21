import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { FilingStatusComboBox } from '@components/TaxProfileForm/FilingStatusComboBox/FilingStatusComboBox'
import { type TaxProfileForm } from '@components/TaxProfileForm/taxProfileFormSchema'
import { type AppForm } from '@features/forms/hooks/useForm'

type FederalTaxSectionProps = {
  form: AppForm<TaxProfileForm>
  isReadOnly?: boolean
}

export const FederalTaxSection = ({ form, isReadOnly }: FederalTaxSectionProps) => {
  return (
    <VStack className='Layer__TaxProfileForm__Section' gap='md'>
      <Heading level={3}>Federal Tax Information</Heading>

      <form.Field name='usConfiguration.federal.filingStatus'>
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

      <form.AppField name='usConfiguration.federal.annualW2Income'>
        {field => (
          <field.FormBigDecimalField
            className='Layer__TaxProfileForm__Field'
            label='Annual W-2 income'
            mode='currency'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter amount'
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.tipIncome'>
        {field => (
          <field.FormBigDecimalField
            className='Layer__TaxProfileForm__Field'
            label='Tip income'
            mode='currency'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter amount'
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.overtimeIncome'>
        {field => (
          <field.FormBigDecimalField
            className='Layer__TaxProfileForm__Field'
            label='Overtime income'
            mode='currency'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter amount'
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.withholding.useCustomWithholding'>
        {field => (
          <field.FormRadioGroupYesNoField
            className='Layer__TaxProfileForm__Field'
            label='Use custom withholding?'
            isReadOnly={isReadOnly}
            inline
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => state.values.usConfiguration?.federal?.withholding?.useCustomWithholding}>
        {useCustomWithholding => useCustomWithholding && (
          <form.AppField name='usConfiguration.federal.withholding.amount'>
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
