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

type DatePickerProps = {
  label: string
  isReadOnly?: boolean
  showLabel?: boolean
  date: ZonedDateTime | null
  minDate?: ZonedDateTime | null
  maxDate?: ZonedDateTime | null
  isInvalid?: boolean
  errorText?: string | null
  onBlur?: () => void
  onChange: (date: ZonedDateTime | null) => void
}

export const DatePicker = ({
  label,
  isReadOnly,
  showLabel = true,
  date,
  minDate,
  maxDate,
  isInvalid,
  errorText,
  onBlur,
  onChange,
}: DatePickerProps) => {
  const additionalAriaProps = !showLabel && { 'aria-label': label }

  const errorTriangle = useMemo(() => (
    <Tooltip offset={12}>
      <TooltipTrigger>
        <FieldError><TriangleAlert size={18} /></FieldError>
      </TooltipTrigger>
      <TooltipContent width='md'>
        {errorText}
      </TooltipContent>
    </Tooltip>
  ), [errorText])

  return (
    <BaseDatePicker
      granularity='day'
      value={date}
      onBlur={onBlur}
      onChange={onChange}
      isInvalid={isInvalid}
      {...additionalAriaProps}
    >
      {showLabel && <Label>{label}</Label>}
      <InputGroup slot='input' isInvalid={!!errorText}>
        <DateInput inset>
          {segment => <DateSegment isReadOnly={isReadOnly} segment={segment} />}
        </DateInput>
        <HStack gap='3xs' align='center'>
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
