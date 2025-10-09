import { startOfToday } from 'date-fns'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { Button } from '../ui/Button/Button'
import { Calendar, CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell } from '../ui/Calendar/Calendar'
import { HStack } from '../ui/Stack/Stack'
import { Heading } from '../ui/Typography/Heading'
import { getLocalTimeZone, fromDate } from '@internationalized/date'

type DateCalendarProps = {
  minDate?: Date
  maxDate?: Date
}
export const DateCalendar = ({ minDate, maxDate = startOfToday() }: DateCalendarProps) => {
  const minZonedDateTime = minDate ? fromDate(minDate, getLocalTimeZone()) : null
  const maxZonedDateTime = fromDate(maxDate, getLocalTimeZone())

  return (
    <Calendar minValue={minZonedDateTime} maxValue={maxZonedDateTime}>
      <HStack align='center' justify='space-between' pbe='xs' className='Layer__DateCalendar__Header'>
        <Button icon inset variant='ghost' slot='previous'>
          <ChevronLeft size={20} />
        </Button>
        <Heading variant='dark' weight='normal' size='sm' />
        <Button icon inset variant='ghost' slot='next'>
          <ChevronRight size={20} />
        </Button>
      </HStack>
      <CalendarGrid>
        <CalendarGridHeader>
          {day => (
            <CalendarHeaderCell>
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody>
          {date => <CalendarCell date={date} />}
        </CalendarGridBody>
      </CalendarGrid>
    </Calendar>
  )
}
