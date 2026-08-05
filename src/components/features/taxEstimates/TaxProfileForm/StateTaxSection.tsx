import { useTranslation } from 'react-i18next'

import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { FilingStatusComboBox } from '@features/taxEstimates/FilingStatusComboBox/FilingStatusComboBox'
import { getFormFieldProps, type TaxProfileFormSectionProps } from '@features/taxEstimates/TaxProfileForm/formUtils'
import { UsStateComboBox } from '@features/taxEstimates/UsStateComboBox/UsStateComboBox'

export const StateTaxSection = ({ form, isReadOnly, isDesktop }: TaxProfileFormSectionProps) => {
  const { t } = useTranslation()
  const desktopFieldProps = getFormFieldProps(isDesktop)

  return (
    <VStack className='Layer__TaxProfileForm__Section' gap='md'>
      <Heading level={3}>{t('taxEstimates:TaxProfileForm.StateTaxSection.label.tax_information', 'State Tax Information')}</Heading>

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
            label={t('taxEstimates:TaxProfileForm.StateTaxSection.label.use_custom_withholding', 'Use custom withholding?')}
            isReadOnly={isReadOnly}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => state.values.usConfiguration?.state?.withholding?.useCustomWithholding}>
        {useCustomWithholding => useCustomWithholding && (
          <form.AppField name='usConfiguration.state.withholding.amount'>
            {field => (
              <field.FormNonRecursiveBigDecimalField
                label={t('taxEstimates:TaxProfileForm.StateTaxSection.label.withholding_amount', 'Withholding amount')}
                mode='currency'
                isReadOnly={isReadOnly}
                placeholder={t('taxEstimates:TaxProfileForm.StateTaxSection.label.enter_amount', 'Enter amount')}
                {...desktopFieldProps}
              />
            )}
          </form.AppField>
        )}
      </form.Subscribe>
    </VStack>
  )
}
