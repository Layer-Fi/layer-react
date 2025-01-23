import { useMemo } from 'react'
import { Text, TextSize, TextWeight } from '../Typography'
import { parseISO, differenceInDays } from 'date-fns'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'

export interface DueStatusProps {
  dueDate: Date | string
  paidAt?: Date | string
  paid?: boolean
}

const dueStatusTitle = (daysDiff: number, paid?: boolean) => {
  if (paid && daysDiff > 0) {
    return {
      type: 'paid',
      diff: daysDiff,
      title: 'Paid',
      diffText: `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} ago`,
    }
  }

  if (paid && daysDiff === 0) {
    return {
      type: 'paid',
      diff: daysDiff,
      title: 'Paid',
      diffText: 'Today',
    }
  }

  if (paid && daysDiff < 0) {
    return {
      type: 'paid',
      diff: daysDiff,
      title: 'Paid',
    }
  }

  if (daysDiff === 0) {
    return {
      type: 'today',
      diff: daysDiff,
      title: 'Due today',
    }
  }

  if (daysDiff > 0) {
    return {
      type: 'overdue',
      diff: daysDiff,
      title: 'Overdue',
      diffText: `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} ago`,
    }
  }

  if (daysDiff < 0 && daysDiff > -4) {
    return {
      type: 'soon',
      diff: daysDiff,
      title: 'Due soon',
      diffText: `Due in ${Math.abs(daysDiff)} ${
        daysDiff === -1 ? 'day' : 'days'
      }`,
    }
  }

  return {
    type: 'before',
    diff: daysDiff,
    diffText: `Due in ${Math.abs(daysDiff)} days`,
  }
}

const getDiff = (refDate: Date | string) => {
  const d = (refDate instanceof Date ? refDate : parseISO(refDate)).setHours(0, 0, 0, 0)
  if (isNaN(d)) {
    return null
  }

  const today = new Date().setHours(0, 0, 0, 0)
  return differenceInDays(today, d)
}

export const DueStatus = ({ dueDate, paidAt, paid }: DueStatusProps) => {
  const date = useMemo(() => {
    try {
      const diff = getDiff(paid && paidAt ? paidAt : dueDate)

      if (diff === null) {
        return null
      }

      return dueStatusTitle(diff, paid)
    }
    catch (_err) {
      return null
    }
  }, [dueDate, paid, paidAt])

  if (!date) {
    return null
  }

  const dataProps = toDataProperties({ status: date.type })

  return (
    <div {...dataProps} className='Layer__due-status'>
      {date.title && (
        <Text className='Layer__due-status__title' weight={TextWeight.bold}>
          {date.title}
        </Text>
      )}
      {date.diffText && (
        <Text className='Layer__due-status__subtitle' size={TextSize.sm}>
          {date.diffText}
        </Text>
      )}
    </div>
  )
}
