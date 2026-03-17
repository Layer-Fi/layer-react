import { useTranslation } from 'react-i18next'

import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { FilingStatusComboBox } from '@components/TaxProfileForm/FilingStatusComboBox/FilingStatusComboBox'
import { getFormFieldProps, type TaxProfileFormSectionProps } from '@components/TaxProfileForm/formUtils'

export const FederalTaxSection = ({ form, isReadOnly, isDesktop }: TaxProfileFormSectionProps) => {
  const { t } = useTranslation()
  const desktopFieldProps = getFormFieldProps(isDesktop)

  return (
    <VStack className='Layer__TaxProfileForm__Section' gap='md'>
      <Heading level={3}>{t('taxEstimates:label.federal_tax_information', 'Federal Tax Information')}</Heading>

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
            label={t('taxEstimates:label.annual_w2_income', 'Annual W-2 income')}
            mode='currency'
            isReadOnly={isReadOnly}
            placeholder={t('taxEstimates:label.enter_amount', 'Enter amount')}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.tipIncome'>
        {field => (
          <field.FormBigDecimalField
            label={t('taxEstimates:label.tip_income', 'Tip income')}
            mode='currency'
            isReadOnly={isReadOnly}
            placeholder={t('taxEstimates:label.enter_amount', 'Enter amount')}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.overtimeIncome'>
        {field => (
          <field.FormBigDecimalField
            label={t('taxEstimates:label.overtime_income', 'Overtime income')}
            mode='currency'
            isReadOnly={isReadOnly}
            placeholder={t('taxEstimates:label.enter_amount', 'Enter amount')}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.withholding.useCustomWithholding'>
        {field => (
          <field.FormRadioGroupYesNoField
            label={t('taxEstimates:label.use_custom_withholding', 'Use custom withholding?')}
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
                label={t('taxEstimates:label.withholding_amount', 'Withholding amount')}
                mode='currency'
                isReadOnly={isReadOnly}
                placeholder={t('taxEstimates:label.enter_amount', 'Enter amount')}
                {...desktopFieldProps}
              />
            )}
          </form.AppField>
        )}
      </form.Subscribe>
    </VStack>
  )
}
