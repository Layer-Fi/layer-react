import { useCallback, useId } from 'react'
import { ComboBox } from '../ui/ComboBox/ComboBox'
import { ReportingBasis } from '../../schemas/common/reportingBasis'

type ReportingBasisOption = {
  label: string
  value: ReportingBasis
}

const ReportingBasisOptionConfig = {
  [ReportingBasis.Accrual]: { label: 'Accrual', value: ReportingBasis.Accrual },
  [ReportingBasis.Cash]: { label: 'Cash', value: ReportingBasis.Cash },
}

const options = Object.values(ReportingBasisOptionConfig)

type ReportingBasisComboBoxProps = {
  value: ReportingBasis | null
  onValueChange: (value: ReportingBasis | null) => void
  className?: string
}

export const ReportingBasisComboBox = ({
  value,
  onValueChange,
  className,
}: ReportingBasisComboBoxProps) => {
  const selectedOption = value ? ReportingBasisOptionConfig[value] : null
  const onSelectedValueChange = useCallback(
    (option: ReportingBasisOption | null) => {
      onValueChange(option?.value || null)
    },
    [onValueChange],
  )

  const inputId = useId()

  return (
    <ComboBox
      options={options}
      onSelectedValueChange={onSelectedValueChange}
      selectedValue={selectedOption}
      isSearchable={false}
      isClearable={false}
      inputId={inputId}
      className={className}
    />
  )
}
