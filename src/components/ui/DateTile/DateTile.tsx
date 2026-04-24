import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './dateTile.scss'

export type DateTileProps = {
  date: Date
}

export const DateTile = ({ date }: DateTileProps) => {
  const { formatDate } = useIntlFormatter()
  const monthLabel = formatDate(date, DateFormat.MonthShort)
  const dayLabel = formatDate(date, DateFormat.Day)
  const weekdayLabel = formatDate(date, DateFormat.WeekdayShort)

  return (
    <VStack className='Layer__UI__DateTile' overflow='hidden'>
      <Span className='Layer__UI__DateTile__Month'>
        {monthLabel}
      </Span>
      <VStack className='Layer__UI__DateTile__Body' align='center' justify='center' pbs='2xs' pbe='xs'>
        <Span className='Layer__UI__DateTile__Day'>
          {dayLabel}
        </Span>
        <Span className='Layer__UI__DateTile__Weekday'>
          {weekdayLabel}
        </Span>
      </VStack>
    </VStack>
  )
}
