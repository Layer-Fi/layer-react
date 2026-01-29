import { useMemo } from 'react'
import { TriangleAlert } from 'lucide-react'

import type { View } from '@internal-types/general'
import { DateInput, DateSegment } from '@ui/Date/Date'
import { FieldError } from '@ui/Form/Form'
import { InputGroup } from '@ui/Input/InputGroup'
import { PickerDropdownIndicator } from '@ui/PickerDropdownIndicator/PickerDropdownIndicator'
import { HStack } from '@ui/Stack/Stack'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

type DatePickerInputProps = {
  errorText?: string | null
  onClick?: () => void
  variant: View
  isReadOnly?: boolean
}

export const DatePickerInput = ({ errorText, variant, onClick, isReadOnly }: DatePickerInputProps) => {
  const errorTriangle = useMemo(() => {
    if (variant === 'mobile' || !errorText) return null

    return (
      <DeprecatedTooltip offset={12}>
        <DeprecatedTooltipTrigger>
          <FieldError><TriangleAlert size={18} /></FieldError>
        </DeprecatedTooltipTrigger>
        <DeprecatedTooltipContent className='Layer__tooltip' width='md'>
          {errorText}
        </DeprecatedTooltipContent>
      </DeprecatedTooltip>
    )
  }, [errorText, variant])

  if (variant === 'mobile') {
    return (
      <InputGroup slot='input' isInvalid={!!errorText} onClick={isReadOnly ? undefined : onClick}>
        <DateInput inset pointerEvents='none'>
          {segment => <DateSegment isReadOnly segment={segment} />}
        </DateInput>
      </InputGroup>
    )
  }

  return (
    <InputGroup slot='input' isInvalid={!!errorText}>
      <DateInput inset>
        {segment => <DateSegment segment={segment} />}
      </DateInput>
      <HStack gap='3xs' align='center' pie='4xs'>
        {errorTriangle}
        {!isReadOnly && <PickerDropdownIndicator onClick={onClick} />}
      </HStack>
    </InputGroup>
  )
}
