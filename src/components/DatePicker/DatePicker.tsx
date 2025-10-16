import ChevronDown from '../../icons/ChevronDown'
import { DateCalendar } from '../DateCalendar/DateCalendar'
import { Button } from '../ui/Button/Button'
import { DatePicker as BaseDatePicker, DateInput, DateSegment } from '../ui/Date/Date'
import { InputGroup } from '../ui/Input/InputGroup'
import { Label } from '../ui/Typography/Text'
import { Popover } from '../ui/Popover/Popover'
import { Dialog } from 'react-aria-components'
import { ZonedDateTime } from '@internationalized/date'
import { FieldError } from '../ui/Form/Form'
import { HStack } from '../ui/Stack/Stack'
import { TriangleAlert } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip/Tooltip'
import { useMemo } from 'react'

export type DatePickerProps = {
  date: ZonedDateTime | null
  onChange: (date: ZonedDateTime | null) => void
  minDate?: ZonedDateTime | null
  maxDate?: ZonedDateTime | null
  label: string
  isReadOnly?: boolean
  showLabel?: boolean
  isInvalid?: boolean
  errorText?: string | null
  onBlur?: () => void
}

export const DatePicker = ({
  label,
  isReadOnly,
  showLabel = true,
  date,
  onChange,
  onBlur,
  isInvalid,
  errorText,
  minDate,
  maxDate,
}: DatePickerProps) => {
  const additionalAriaProps = !showLabel && { 'aria-label': label }

  const errorTriangle = useMemo(() => (
    <Tooltip offset={12}>
      <TooltipTrigger>
        <FieldError><TriangleAlert size={18} /></FieldError>
      </TooltipTrigger>
      <TooltipContent className='Layer__tooltip' width='md'>
        {errorText}
      </TooltipContent>
    </Tooltip>
  ), [errorText])

  return (
    <BaseDatePicker
      granularity='day'
      value={date}
      onChange={onChange}
      onBlur={onBlur}
      isInvalid={isInvalid}
      {...additionalAriaProps}
    >
      {showLabel && <Label>{label}</Label>}
      <InputGroup slot='input' isInvalid={!!errorText}>
        <DateInput inset>
          {segment => <DateSegment isReadOnly={isReadOnly} segment={segment} />}
        </DateInput>
        <HStack gap='xs' align='center'>
          {errorText && errorTriangle}
          <Button icon inset variant='ghost'>
            <ChevronDown size={20} />
          </Button>
        </HStack>
      </InputGroup>
      <Popover>
        <Dialog>
          <DateCalendar minDate={minDate} maxDate={maxDate} />
        </Dialog>
      </Popover>
    </BaseDatePicker>
  )
}
