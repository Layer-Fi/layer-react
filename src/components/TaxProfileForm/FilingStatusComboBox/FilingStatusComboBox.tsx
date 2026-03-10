import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

import { FilingStatus } from '@schemas/taxEstimates/filingStatus'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

import './filingStatusComboBox.scss'

const FILING_STATUS_OPTIONS = [
  { value: FilingStatus.SINGLE, label: i18next.t('single', 'Single') },
  { value: FilingStatus.MARRIED, label: i18next.t('marriedFilingJointly', 'Married filing jointly') },
  { value: FilingStatus.MARRIED_SEPARATELY, label: i18next.t('marriedFilingSeparately', 'Married filing separately') },
  { value: FilingStatus.HEAD, label: i18next.t('headOfHousehold', 'Head of household') },
  { value: FilingStatus.WIDOWER, label: i18next.t('qualifyingWidower', 'Qualifying widow(er)') },
] as const

type FilingStatusOption = typeof FILING_STATUS_OPTIONS[number]

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

  const selectedValue = useMemo(() =>
    value
      ? FILING_STATUS_OPTIONS.find(o => o.value === value) ?? null
      : null,
  [value])

  const handleChange = useCallback((option: FilingStatusOption | null) => {
    onChange(option ? option.value : null)
  }, [onChange])

  const inputId = useId()

  return (
    <HStack className={combinedClassName}>
      <Label size='sm' htmlFor={inputId}>
        {t('filingStatus', 'Filing status')}
      </Label>
      <ComboBox<FilingStatusOption>
        options={FILING_STATUS_OPTIONS}
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
