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
      <Heading level={3}>{t('taxEstimates:federalTaxInformation', 'Federal Tax Information')}</Heading>

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
            label={t('taxEstimates:annualW2Income', 'Annual W-2 income')}
            mode='currency'
            isReadOnly={isReadOnly}
            placeholder={t('taxEstimates:enterAmount', 'Enter amount')}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.tipIncome'>
        {field => (
          <field.FormBigDecimalField
            label={t('taxEstimates:tipIncome', 'Tip income')}
            mode='currency'
            isReadOnly={isReadOnly}
            placeholder={t('taxEstimates:enterAmount', 'Enter amount')}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.overtimeIncome'>
        {field => (
          <field.FormBigDecimalField
            label={t('taxEstimates:overtimeIncome', 'Overtime income')}
            mode='currency'
            isReadOnly={isReadOnly}
            placeholder={t('taxEstimates:enterAmount', 'Enter amount')}
            {...desktopFieldProps}
          />
        )}
      </form.AppField>

      <form.AppField name='usConfiguration.federal.withholding.useCustomWithholding'>
        {field => (
          <field.FormRadioGroupYesNoField
            label={t('taxEstimates:useCustomWithholding', 'Use custom withholding?')}
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
                label={t('taxEstimates:withholdingAmount', 'Withholding amount')}
                mode='currency'
                isReadOnly={isReadOnly}
                placeholder={t('taxEstimates:enterAmount', 'Enter amount')}
                {...desktopFieldProps}
              />
            )}
          </form.AppField>
        )}
      </form.Subscribe>
    </VStack>
  )
}
