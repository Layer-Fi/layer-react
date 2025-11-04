import { useCallback, useState } from 'react'
import {
  GridList,
  GridListItem,
} from 'react-aria-components'
import { CalendarDate, getLocalTimeZone, ZonedDateTime, fromDate } from '@internationalized/date'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Button } from '../ui/Button/Button'
import { Heading } from '../ui/Typography/Heading'
import { MONTHS } from './utils'
import './monthCalendar.scss'

export function MonthCalendar({
  date,
  onChange,
  minDate,
  maxDate,
}: {
  date: ZonedDateTime | null
  onChange: (val: ZonedDateTime) => void
  minDate?: ZonedDateTime | null
  maxDate?: ZonedDateTime | null
}) {
  const minYear = minDate?.year ?? null
  const maxYear = maxDate?.year ?? null
  const [year, setYear] = useState(() => date?.year ?? new Date().getFullYear())

  const clampYear = useCallback((y: number) => {
    if (minYear != null && y < minYear) return minYear
    if (maxYear != null && y > maxYear) return maxYear
    return y
  }, [minYear, maxYear])

  const isMonthDisabled = useCallback((month: number): boolean => {
    const date = new CalendarDate(year, month, 1)

    if (minDate) {
      const minCalendarDate = new CalendarDate(minDate.year, minDate.month, 1)
      if (date.compare(minCalendarDate) < 0) return true
    }

    if (maxDate) {
      const maxCalendarDate = new CalendarDate(maxDate.year, maxDate.month, 1)
      if (date.compare(maxCalendarDate) > 0) return true
    }

    return false
  }, [year, minDate, maxDate])

  const selectMonth = useCallback((m: number) => {
    if (isMonthDisabled(m)) return
    const nextDate = new Date(year, m - 1, 1)
    const zonedNext = fromDate(nextDate, getLocalTimeZone())
    onChange(zonedNext)
  }, [year, isMonthDisabled, onChange])

  const isPrevYearDisabled = minYear != null && year <= minYear
  const isNextYearDisabled = maxYear != null && year >= maxYear

  const goToPreviousYear = useCallback(() => {
    if (!isPrevYearDisabled) {
      setYear((y: number) => clampYear(y - 1))
    }
  }, [isPrevYearDisabled, clampYear])

  const goToNextYear = useCallback(() => {
    if (!isNextYearDisabled) {
      setYear((y: number) => clampYear(y + 1))
    }
  }, [isNextYearDisabled, clampYear])

  return (
    <VStack>
      <HStack align='center' justify='space-between' pb='xs' pi='xs' className='Layer__MonthCalendar__Header'>
        <Button
          icon
          inset
          variant='ghost'
          onPress={goToPreviousYear}
          isDisabled={isPrevYearDisabled}
          aria-label='Previous year'
        >
          <ChevronLeft size={20} />
        </Button>
        <Heading weight='normal' size='sm'>{year}</Heading>
        <Button
          icon
          inset
          variant='ghost'
          onPress={goToNextYear}
          isDisabled={isNextYearDisabled}
          aria-label='Next year'
        >
          <ChevronRight size={20} />
        </Button>
      </HStack>
      <GridList
        aria-label='Select a month'
        selectionMode='single'
        selectedKeys={date ? new Set([date.month]) : new Set()}
        onSelectionChange={(keys) => {
          const selectedKey = [...keys][0]
          if (typeof selectedKey === 'number') {
            selectMonth(selectedKey)
          }
        }}
        className='Layer__MonthCalendar__MonthGrid'
      >
        {MONTHS.map(m => (
          <GridListItem
            id={m.key}
            key={m.key}
            textValue={m.abbreviation}
            className='Layer__MonthCalendar__MonthGridItem'
            isDisabled={isMonthDisabled(m.key)}
          >
            {m.abbreviation}
          </GridListItem>
        ))}
      </GridList>
    </VStack>
  )
}
