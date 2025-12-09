import { useCallback, useRef, useState } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import { format as formatTime } from 'date-fns'
import { Dialog, DialogTrigger } from 'react-aria-components'

import { MONTH_YEAR_FORMAT, MONTH_YEAR_FORMAT_SHORT } from '@config/general'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import ChevronDown from '@icons/ChevronDown'
import { Button } from '@ui/Button/Button'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { MonthCalendar } from '@components/MonthCalendar/MonthCalendar'
import { ResponsivePopover } from '@components/ResponsivePopover/ResponsivePopover'

import './monthPicker.scss'

type MonthPickerProps = {
  label: string
  showLabel?: boolean
  date: ZonedDateTime
  onChange: (val: ZonedDateTime) => void
  minDate?: ZonedDateTime | null
  maxDate?: ZonedDateTime | null
  truncateMonth?: boolean
}

export const MonthPicker = ({
  label,
  showLabel = true,
  date,
  onChange,
  minDate = null,
  maxDate = null,
  truncateMonth = false,
}: MonthPickerProps) => {
  const triggerRef = useRef(null)
  const [isPopoverOpen, setPopoverOpen] = useState(false)
  const { value } = useSizeClass()

  const onChangeMonth = useCallback((val: ZonedDateTime) => {
    onChange(val)
    setPopoverOpen(false)
  }, [onChange])

  const inputValue = formatTime(date.toDate(), truncateMonth ? MONTH_YEAR_FORMAT_SHORT : MONTH_YEAR_FORMAT)
  const additionalAriaProps = !showLabel && { 'aria-label': label }

  return (
    <DialogTrigger isOpen={isPopoverOpen} onOpenChange={setPopoverOpen}>
      {showLabel && <Label>{label}</Label>}
      <InputGroup ref={triggerRef} slot='input' className='Layer__MonthPicker__InputGroup' onClick={() => setPopoverOpen(true)}>
        <Input inset {...additionalAriaProps} value={inputValue} readOnly />
        <HStack gap='3xs' align='center'>
          <Button icon inset variant='ghost'>
            <ChevronDown size={20} />
          </Button>
        </HStack>
      </InputGroup>
      <ResponsivePopover triggerRef={triggerRef}>
        <Dialog>
          <MonthCalendar
            date={date}
            onChange={onChangeMonth}
            minDate={minDate}
            maxDate={maxDate}
            variant={value}
          />
        </Dialog>
      </ResponsivePopover>
    </DialogTrigger>
  )
}
