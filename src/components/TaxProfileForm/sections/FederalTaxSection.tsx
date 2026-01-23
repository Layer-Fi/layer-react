import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { FilingStatusComboBox } from '@components/TaxProfileForm/FilingStatusComboBox/FilingStatusComboBox'
import { getFormFieldProps, type TaxProfileFormSectionProps } from '@components/TaxProfileForm/formUtils'

export const FederalTaxSection = ({ form, isReadOnly, isDesktop }: TaxProfileFormSectionProps) => {
  const desktopFieldProps = getFormFieldProps(isDesktop)

  return (
    <VStack className='Layer__TaxProfileForm__Section' gap='md'>
      <Heading level={3}>Federal Tax Information</Heading>

      <form.Field name='usConfiguration.federal.filingStatus'>
        {field => (
          <FilingStatusComboBox
            value={field.state.value ?? null}
            onChange={field.handleChange}
            isReadOnly={isReadOnly}
            {...desktopFieldProps}
          />
        )}
      </form.Field>

      <form.AppField name='usConfiguration.federal.annualW2Income'>
        {field => (
          <field.FormBigDecimalField
            label='Annual W-2 income'
            mode='currency'
            isReadOnly={isReadOnly}
            placeholder='Enter amount'
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.tipIncome'>
        {field => (
          <field.FormBigDecimalField
            label='Tip income'
            mode='currency'
            isReadOnly={isReadOnly}
            placeholder='Enter amount'
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.overtimeIncome'>
        {field => (
          <field.FormBigDecimalField
            label='Overtime income'
            mode='currency'
            isReadOnly={isReadOnly}
            placeholder='Enter amount'
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.withholding.useCustomWithholding'>
        {field => (
          <field.FormRadioGroupYesNoField
            label='Use custom withholding?'
            isReadOnly={isReadOnly}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => state.values.usConfiguration?.federal?.withholding?.useCustomWithholding}>
        {useCustomWithholding => useCustomWithholding && (
          <form.AppField name='usConfiguration.federal.withholding.amount'>
            {field => (
              <field.FormBigDecimalField
                label='Withholding amount'
                mode='currency'
                isReadOnly={isReadOnly}
                placeholder='Enter amount'
                {...desktopFieldProps}
              />
            )}
          </form.AppField>
        )}
      </form.Subscribe>
    </VStack>
  )
}
