import { BigDecimal as BD } from 'effect'

import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { getFormFieldProps, type TaxProfileFormSectionProps } from '@components/TaxProfileForm/formUtils'

const MAX_HOME_OFFICE_AREA = BD.fromBigInt(BigInt(300))

export const DeductionsSection = ({ form, isReadOnly, isDesktop }: TaxProfileFormSectionProps) => {
  const desktopFieldProps = getFormFieldProps(isDesktop)

  return (
    <VStack className='Layer__TaxProfileForm__Section' gap='md'>
      <Heading level={3}>Deductions</Heading>

      <form.AppField name='usConfiguration.deductions.homeOffice.useHomeOfficeDeduction'>
        {field => (
          <field.FormRadioGroupYesNoField
            label='Use simplified home office deduction?'
            isReadOnly={isReadOnly}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => state.values.usConfiguration?.deductions?.homeOffice?.useHomeOfficeDeduction}>
        {useHomeOffice => useHomeOffice && (
          <form.AppField name='usConfiguration.deductions.homeOffice.homeOfficeArea'>
            {field => (
              <field.FormBigDecimalField
                label='Home office area (sq ft)'
                isReadOnly={isReadOnly}
                placeholder='Enter area'
                mode='decimal'
                maxDecimalPlaces={3}
                maxValue={MAX_HOME_OFFICE_AREA}
                {...desktopFieldProps}
              />
            )}
          </form.AppField>
        )}
      </form.Subscribe>

      <form.AppField name='usConfiguration.deductions.vehicle.useMileageDeduction'>
        {field => (
          <field.FormRadioGroupYesNoField
            label='Use standard mileage deduction?'
            isReadOnly={isReadOnly}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>
    </VStack>
  )
}
