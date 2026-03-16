import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { FilingStatus } from '@schemas/taxEstimates/filingStatus'
import { translationKey } from '@utils/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

import './filingStatusComboBox.scss'

const FILING_STATUS_CONFIG = [
  { value: FilingStatus.SINGLE, ...translationKey('taxEstimates.single', 'Single') },
  { value: FilingStatus.MARRIED, ...translationKey('taxEstimates.marriedFilingJointly', 'Married filing jointly') },
  { value: FilingStatus.MARRIED_SEPARATELY, ...translationKey('taxEstimates.marriedFilingSeparately', 'Married filing separately') },
  { value: FilingStatus.HEAD, ...translationKey('taxEstimates.headOfHousehold', 'Head of household') },
  { value: FilingStatus.WIDOWER, ...translationKey('taxEstimates.qualifyingWidower', 'Qualifying widow(er)') },
] as const

type FilingStatusOption = { value: FilingStatus, label: string }

type FilingStatusComboBoxProps = {
  value: FilingStatus | null
  onChange: (value: FilingStatus | null) => void
  isReadOnly?: boolean
  className?: string
  inline?: boolean
}

export const FilingStatusComboBox = ({
  value,
  onChange,
  isReadOnly,
  className,
  inline,
}: FilingStatusComboBoxProps) => {
  const { t } = useTranslation()
  const combinedClassName = classNames(
    'Layer__FilingStatusComboBox',
    inline && 'Layer__FilingStatusComboBox--inline',
    className,
  )

  const options = useMemo<FilingStatusOption[]>(
    () => FILING_STATUS_CONFIG.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const selectedValue = useMemo(() =>
    value
      ? options.find(o => o.value === value) ?? null
      : null,
  [value, options])

  const handleChange = useCallback((option: FilingStatusOption | null) => {
    onChange(option ? option.value : null)
  }, [onChange])

  const inputId = useId()

  return (
    <HStack className={combinedClassName}>
      <Label size='sm' htmlFor={inputId}>
        {t('taxEstimates.filingStatus', 'Filing status')}
      </Label>
      <ComboBox<FilingStatusOption>
        options={options}
        selectedValue={selectedValue}
        onSelectedValueChange={handleChange}
        inputId={inputId}
        isSearchable={false}
        isClearable
        isReadOnly={isReadOnly}
      />
    </HStack>
  )
}
