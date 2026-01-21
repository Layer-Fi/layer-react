import { BigDecimal as BD } from 'effect'

import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { type TaxProfileForm } from '@components/TaxProfileForm/taxProfileFormSchema'
import { type AppForm } from '@features/forms/hooks/useForm'

type DeductionsSectionProps = {
  form: AppForm<TaxProfileForm>
  isReadOnly?: boolean
}

const MAX_HOME_OFFICE_AREA = BD.fromBigInt(BigInt(300))

export const DeductionsSection = ({ form, isReadOnly }: DeductionsSectionProps) => {
  return (
    <VStack className='Layer__TaxProfileForm__Section' gap='md'>
      <Heading level={3}>Deductions</Heading>

      <form.AppField name='usConfiguration.deductions.homeOffice.useHomeOfficeDeduction'>
        {field => (
          <field.FormRadioGroupYesNoField
            className='Layer__TaxProfileForm__Field'
            label='Use simplified home office deduction?'
            isReadOnly={isReadOnly}
            inline
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => state.values.usConfiguration?.deductions?.homeOffice?.useHomeOfficeDeduction}>
        {useHomeOffice => useHomeOffice && (
          <form.AppField name='usConfiguration.deductions.homeOffice.homeOfficeArea'>
            {field => (
              <field.FormBigDecimalField
                className='Layer__TaxProfileForm__Field'
                label='Home office area (sq ft)'
                inline
                isReadOnly={isReadOnly}
                placeholder='Enter area'
                mode='decimal'
                maxDecimalPlaces={3}
                maxValue={MAX_HOME_OFFICE_AREA}
              />
            )}
          </form.AppField>
        )}
      </form.Subscribe>

      <form.AppField name='usConfiguration.deductions.vehicle.useMileageDeduction'>
        {field => (
          <field.FormRadioGroupYesNoField
            className='Layer__TaxProfileForm__Field'
            label='Use standard mileage deduction?'
            isReadOnly={isReadOnly}
            inline
          />
        )}
      </form.AppField>
    </VStack>
  )
}
