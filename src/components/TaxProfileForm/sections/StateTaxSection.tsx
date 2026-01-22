import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { FilingStatusComboBox } from '@components/TaxProfileForm/FilingStatusComboBox/FilingStatusComboBox'
import { getFormFieldProps, type TaxProfileFormSectionProps } from '@components/TaxProfileForm/formUtils'
import { UsStateComboBox } from '@components/UsStateComboBox/UsStateComboBox'

export const StateTaxSection = ({ form, isReadOnly, isDesktop }: TaxProfileFormSectionProps) => {
  const desktopFieldProps = getFormFieldProps(isDesktop)

  return (
    <VStack className='Layer__TaxProfileForm__Section' gap='md'>
      <Heading level={3}>State Tax Information</Heading>

      <form.Field name='usConfiguration.state.taxState'>
        {field => (
          <UsStateComboBox
            value={field.state.value ?? null}
            onChange={field.handleChange}
            isReadOnly={isReadOnly}
            {...desktopFieldProps}
          />
        )}
      </form.Field>

      <form.Field name='usConfiguration.state.filingStatus'>
        {field => (
          <FilingStatusComboBox
            value={field.state.value ?? null}
            onChange={field.handleChange}
            isReadOnly={isReadOnly}
            {...desktopFieldProps}
          />
        )}
      </form.Field>

      <form.AppField name='usConfiguration.state.withholding.useCustomWithholding'>
        {field => (
          <field.FormRadioGroupYesNoField
            label='Use custom withholding?'
            isReadOnly={isReadOnly}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => state.values.usConfiguration?.state?.withholding?.useCustomWithholding}>
        {useCustomWithholding => useCustomWithholding && (
          <form.AppField name='usConfiguration.state.withholding.amount'>
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
