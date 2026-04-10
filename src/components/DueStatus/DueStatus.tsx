import { useMemo } from 'react'
import { differenceInDays, parseISO } from 'date-fns'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

import './dueStatus.scss'

export interface DueStatusProps {
  dueDate: Date | string
  paidAt?: Date | string
  size?: 'sm' | 'md'
}

const dueStatusTitle = (
  daysDiff: number,
  paid: boolean | undefined,
  t: TFunction,
  formatNumber: (value: number) => string,
) => {
  if (paid && daysDiff > 0) {
    return {
      type: 'paid',
      diff: daysDiff,
      title: t('common:state.paid', 'Paid'),
      diffText: tPlural(t, 'common:label.days_ago', {
        count: daysDiff,
        displayCount: formatNumber(daysDiff),
        one: '{{displayCount}} day ago',
        other: '{{displayCount}} days ago',
      }),
    }
  }

  if (paid && daysDiff === 0) {
    return {
      type: 'paid',
      diff: daysDiff,
      title: t('common:state.paid', 'Paid'),
      diffText: t('common:label.today', 'Today'),
    }
  }

  if (paid && daysDiff < 0) {
    return {
      type: 'paid',
      diff: daysDiff,
      title: t('common:state.paid', 'Paid'),
    }
  }

  if (daysDiff === 0) {
    return {
      type: 'today',
      diff: daysDiff,
      title: t('common:state.due_today', 'Due today'),
    }
  }

  if (daysDiff > 0) {
    return {
      type: 'overdue',
      diff: daysDiff,
      title: t('common:state.overdue', 'Overdue'),
      diffText: tPlural(t, 'common:label.days_ago', {
        count: daysDiff,
        displayCount: formatNumber(daysDiff),
        one: '{{displayCount}} day ago',
        other: '{{displayCount}} days ago',
      }),
    }
  }

  if (daysDiff < 0 && daysDiff > -4) {
    return {
      type: 'soon',
      diff: daysDiff,
      title: t('common:state.due_soon', 'Due soon'),
      diffText: tPlural(t, 'common:state.due_in_count_days', {
        count: Math.abs(daysDiff),
        displayCount: formatNumber(Math.abs(daysDiff)),
        one: 'Due in {{displayCount}} day',
        other: 'Due in {{displayCount}} days',
      }),
    }
  }

  return {
    type: 'before',
    diff: daysDiff,
    diffText: tPlural(t, 'common:state.due_in_count_days', {
      count: Math.abs(daysDiff),
      displayCount: formatNumber(Math.abs(daysDiff)),
      one: 'Due in {{displayCount}} day',
      other: 'Due in {{displayCount}} days',
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
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const date = useMemo(() => {
    try {
      const diff = getDiff(paidAt ? paidAt : dueDate)

      if (diff === null) {
        return null
      }

      return dueStatusTitle(diff, !!paidAt, t, formatNumber)
    }
    catch (_err) {
      return null
    }
  }, [dueDate, paidAt, t, formatNumber])

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
