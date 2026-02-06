import { useCallback, useId, useRef, useState } from 'react'
import { type ZonedDateTime } from '@internationalized/date'
import classNames from 'classnames'
import { format as formatTime } from 'date-fns'
import { Dialog, DialogTrigger } from 'react-aria-components'

import { MONTH_YEAR_FORMAT, MONTH_YEAR_FORMAT_SHORT } from '@config/general'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { PickerDropdownIndicator } from '@ui/PickerDropdownIndicator/PickerDropdownIndicator'
import { VStack } from '@ui/Stack/Stack'
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

  const inputId = useId()
  return (
    <VStack>
      {showLabel && <Label pbe='3xs' size='sm' htmlFor={inputId}>{label}</Label>}
      <DialogTrigger isOpen={isPopoverOpen} onOpenChange={setPopoverOpen}>
        <InputGroup
          ref={triggerRef}
          slot='input'
          className={classNames('Layer__MonthPicker__InputGroup', { 'Layer__MonthPicker__InputGroup--truncated': truncateMonth })}
          onClick={() => setPopoverOpen(true)}
        >
          <Input inset {...additionalAriaProps} value={inputValue} readOnly id={inputId} />
          <PickerDropdownIndicator onClick={() => setPopoverOpen(true)} />
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
    </VStack>
  )
}
