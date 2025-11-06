import { useMemo } from 'react'
import ChevronDown from '@icons/ChevronDown'
import { Button } from '@ui/Button/Button'
import { DateInput, DateSegment } from '@ui/Date/Date'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack } from '@ui/Stack/Stack'
import { FieldError } from '@ui/Form/Form'
import { TriangleAlert } from 'lucide-react'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'
import type { View } from '@internal-types/general'

type DatePickerInputProps = {
  errorText?: string | null
  onClick?: () => void
  variant: View
}

export const DatePickerInput = ({ errorText, variant, onClick }: DatePickerInputProps) => {
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
      <InputGroup slot='input' isInvalid={!!errorText} onClick={onClick}>
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
      <HStack gap='3xs' align='center'>
        {errorTriangle}
        <Button icon inset variant='ghost' onClick={onClick}>
          <ChevronDown size={20} />
        </Button>
      </HStack>
    </InputGroup>
  )
}
