import { Heading } from '../ui/Typography/Heading'
import { Button } from '../ui/Button/Button'
import ChevronLeft from '../../icons/ChevronLeft'
import ChevronRight from '../../icons/ChevronRight'
import { Calendar, CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell } from '../ui/Calendar/Calendar'
import { HStack } from '../ui/Stack/Stack'
import { type ZonedDateTime } from '@internationalized/date'
import './dateCalendar.scss'

type DateCalendarProps = {
  minDate?: ZonedDateTime | null
  maxDate?: ZonedDateTime | null
}

export const DateCalendar = ({ minDate, maxDate }: DateCalendarProps) => {
  return (
    <Calendar minValue={minDate} maxValue={maxDate}>
      <HStack align='center' justify='space-between' pb='xs' pi='xs' className='Layer__DateCalendar__Header'>
        <Button icon inset variant='ghost' slot='previous'>
          <ChevronLeft size={20} />
        </Button>
        <Heading weight='normal' size='sm' />
        <Button icon inset variant='ghost' slot='next'>
          <ChevronRight size={20} />
        </Button>
      </HStack>
      <HStack pb='xs' pi='xs'>
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
      </HStack>
    </Calendar>
  )
}
