import React, { useMemo } from 'react'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'
import { parseISO, differenceInDays } from 'date-fns'

export interface DueStatusProps {
  dueDate: Date | string
}

const dueStatusTitle = (daysDiff: number) => {
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

export const DueStatus = ({ dueDate }: DueStatusProps) => {
  const date = useMemo(() => {
    try {
      const d = parseISO(
        dueDate instanceof Date ? dueDate.toString() : dueDate,
      ).setHours(0, 0, 0, 0)
      const today = new Date().setHours(0, 0, 0, 0)
      let diff = differenceInDays(today, d)
      return dueStatusTitle(diff)
    } catch (_err) {
      return null
    }
  }, [dueDate])

  if (!date) {
    return null
  }

  return (
    <div className={`Layer__due-status Layer__due-status--${date.type}`}>
      {date.title && (
        <Text className='Layer__due-status__title'>{date.title}</Text>
      )}
      {date.diffText && (
        <Text className='Layer__due-status__subtitle' size={TextSize.sm}>
          {date.diffText}
        </Text>
      )}
    </div>
  )
}
