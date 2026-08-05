import { useCallback, useId, useMemo } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { useTranslation } from 'react-i18next'

import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

import './yearPicker.scss'

type YearOption = {
  label: string
  value: string
}

type YearPickerProps = {
  label?: string
  showLabel?: boolean
  year: number
  onChange: (year: number) => void
  minDate?: ZonedDateTime | null
  maxDate?: ZonedDateTime | null
  isDisabled?: boolean
}

export const YearPicker = ({
  label,
  showLabel = false,
  year,
  onChange,
  minDate = null,
  maxDate = null,
  isDisabled = false,
}: YearPickerProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const inputId = useId()
  const coercedLabel = label ?? t('date:label.year', 'Year')
  const minYear = minDate?.year ?? null
  const maxYear = maxDate?.year ?? null

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const effectiveMinYear = minYear ?? currentYear - 10
    const effectiveMaxYear = maxYear ?? currentYear

    const count = effectiveMaxYear - effectiveMinYear + 1
    if (count <= 0) return []

    return Array.from({ length: count }, (_, i): YearOption => {
      const optionYear = effectiveMaxYear - i
      return {
        label: formatDate(new Date(optionYear, 0, 1), DateFormat.Year),
        value: String(optionYear),
      }
    })
  }, [formatDate, minYear, maxYear])

  const selectedYearOption = useMemo(() => {
    return yearOptions.find(opt => opt.value === String(year)) ?? yearOptions[0]
  }, [yearOptions, year])

  const handleChange = useCallback((option: YearOption | null) => {
    if (option) {
      onChange(Number(option.value))
    }
  }, [onChange])

  const additionalAriaProps = !showLabel && { 'aria-label': coercedLabel }

  return (
    <VStack>
      {showLabel && <Label pbe='3xs' size='sm' htmlFor={inputId}>{coercedLabel}</Label>}
      <ComboBox
        selectedValue={selectedYearOption}
        onSelectedValueChange={handleChange}
        options={yearOptions}
        isSearchable={false}
        isClearable={false}
        isDisabled={isDisabled}
        inputId={inputId}
        className='Layer__YearPicker'
        {...additionalAriaProps}
      />
    </VStack>
  )
}
