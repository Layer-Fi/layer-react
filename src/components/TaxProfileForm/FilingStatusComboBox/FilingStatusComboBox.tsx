import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'

import { FilingStatus } from '@schemas/taxEstimates/filingStatus'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

import './filingStatusComboBox.scss'

const FILING_STATUS_OPTIONS = [
  { value: FilingStatus.SINGLE, label: 'Single' },
  { value: FilingStatus.MARRIED, label: 'Married filing jointly' },
  { value: FilingStatus.MARRIED_SEPARATELY, label: 'Married filing separately' },
  { value: FilingStatus.HEAD, label: 'Head of household' },
  { value: FilingStatus.WIDOWER, label: 'Qualifying widow(er)' },
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
        Filing status
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
