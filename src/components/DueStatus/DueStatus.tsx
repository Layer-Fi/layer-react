import { useMemo } from 'react'
import { differenceInDays, parseISO } from 'date-fns'
import i18next from 'i18next'

import { i18nextPlural } from '@utils/i18n/plural'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

import './dueStatus.scss'

export interface DueStatusProps {
  dueDate: Date | string
  paidAt?: Date | string
  size?: 'sm' | 'md'
}

const dueStatusTitle = (daysDiff: number, paid?: boolean) => {
  if (paid && daysDiff > 0) {
    return {
      type: 'paid',
      diff: daysDiff,
      title: i18next.t('paid', 'Paid'),
      diffText: i18nextPlural('daysAgo', {
        count: daysDiff,
        one: '{{count}} day ago',
        other: '{{count}} days ago',
      }),
    }
  }

  if (paid && daysDiff === 0) {
    return {
      type: 'paid',
      diff: daysDiff,
      title: i18next.t('paid', 'Paid'),
      diffText: i18next.t('today', 'Today'),
    }
  }

  if (paid && daysDiff < 0) {
    return {
      type: 'paid',
      diff: daysDiff,
      title: i18next.t('paid', 'Paid'),
    }
  }

  if (daysDiff === 0) {
    return {
      type: 'today',
      diff: daysDiff,
      title: i18next.t('dueToday', 'Due today'),
    }
  }

  if (daysDiff > 0) {
    return {
      type: 'overdue',
      diff: daysDiff,
      title: i18next.t('overdue', 'Overdue'),
      diffText: i18nextPlural('daysAgo', {
        count: daysDiff,
        one: '{{count}} day ago',
        other: '{{count}} days ago',
      }),
    }
  }

  if (daysDiff < 0 && daysDiff > -4) {
    return {
      type: 'soon',
      diff: daysDiff,
      title: i18next.t('dueSoon', 'Due soon'),
      diffText: i18nextPlural('dueInCountDays', {
        count: Math.abs(daysDiff),
        one: 'Due in {{count}} day',
        other: 'Due in {{count}} days',
      }),
    }
  }

  return {
    type: 'before',
    diff: daysDiff,
    diffText: i18nextPlural('dueInCountDays', {
      count: Math.abs(daysDiff),
      one: 'Due in {{count}} day',
      other: 'Due in {{count}} days',
    }),
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

export const DueStatus = ({ dueDate, paidAt, size = 'md' }: DueStatusProps) => {
  const date = useMemo(() => {
    try {
      const diff = getDiff(paidAt ? paidAt : dueDate)

      if (diff === null) {
        return null
      }

      return dueStatusTitle(diff, Boolean(paidAt))
    }
    catch (_err) {
      return null
    }
  }, [dueDate, paidAt])

  if (!date) {
    return null
  }

  const dataProps = toDataProperties({ status: date.type })

  return (
    <div {...dataProps} className={`Layer__due-status Layer__due-status--${size}`}>
      {date.title && (
        <Text
          className='Layer__due-status__title'
          weight={TextWeight.bold}
          size={size === 'sm' ? TextSize.sm : TextSize.md}
        >
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
