import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { ReportingBasis } from '@schemas/accountingConfiguration'
import type { UnifiedReportReportingBasis } from '@schemas/reports/unifiedReport'
import { translationKey } from '@utils/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

import './unifiedReportReportingBasisControl.scss'

const REPORTING_BASIS_CONFIG = [
  { value: ReportingBasis.Cash, ...translationKey('reports:label.cash', 'Cash') },
  { value: ReportingBasis.Accrual, ...translationKey('reports:label.accrual', 'Accrual') },
] satisfies ReadonlyArray<{ value: UnifiedReportReportingBasis, i18nKey: string, defaultValue: string }>

type ReportingBasisOption = {
  label: string
  value: UnifiedReportReportingBasis
}

type UnifiedReportReportingBasisControlProps = {
  value: UnifiedReportReportingBasis
  onValueChange: (value: UnifiedReportReportingBasis) => void
}

const useReportingBasisControlData = () => {
  const { t } = useTranslation()

  const label = t('reports:label.reporting_basis', 'Reporting basis')
  const options = REPORTING_BASIS_CONFIG.map(({ value, i18nKey, defaultValue }) => ({
    value,
    label: t(i18nKey, defaultValue),
  }))

  return { label, options }
}

export function UnifiedReportReportingBasisControl({
  value,
  onValueChange,
}: UnifiedReportReportingBasisControlProps) {
  const inputId = useId()
  const { label, options } = useReportingBasisControlData()
  const selectedOption = value ? (options.find(option => option.value === value) ?? null) : null

  const handleSelectedValueChange = (option: ReportingBasisOption | null) => {
    if (option) onValueChange(option.value)
  }

  return (
    <VStack className='Layer__UnifiedReports__ReportingBasisControl__Container'>
      <Label pbe='3xs' size='sm' htmlFor={inputId}>{label}</Label>
      <ComboBox<ReportingBasisOption>
        options={options}
        onSelectedValueChange={handleSelectedValueChange}
        selectedValue={selectedOption}
        isSearchable={false}
        isClearable={false}
        inputId={inputId}
      />
    </VStack>
  )
}
