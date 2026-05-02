import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { safeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { type BookkeepingPeriod, BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import AlertCircle from '@icons/AlertCircle'
import CheckCircle from '@icons/CheckCircle'
import Clock from '@icons/Clock'
import { HStack } from '@ui/Stack/Stack'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

type TaskStatusBadgeProps = {
  status: BookkeepingPeriod['status']
  tasksCount?: number
}

const useBadgeConfig = (
  status: TaskStatusBadgeProps['status'],
  tasksCount: TaskStatusBadgeProps['tasksCount'],
) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { isMobile } = useSizeClass()

  const label = useMemo(() => {
    if (!tasksCount) {
      return undefined
    }

    if (isMobile) {
      return formatNumber(tasksCount)
    }

    return tPlural(t, 'bookkeeping:label.count_tasks', {
      count: tasksCount,
      displayCount: formatNumber(tasksCount),
      one: '{{displayCount}} task',
      other: '{{displayCount}} tasks',
    })
  }, [tasksCount, t, formatNumber, isMobile])

  switch (status) {
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER:
    case BookkeepingPeriodStatus.NOT_STARTED:
    case BookkeepingPeriodStatus.CLOSING_IN_REVIEW: {
      return {
        color: 'info' as const,
        icon: <Clock size={12} />,
        label,
        labelShort: tasksCount ? formatNumber(tasksCount) : undefined,
      }
    }
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER:
    case BookkeepingPeriodStatus.CLOSED_OPEN_TASKS: {
      return {
        color: 'warning' as const,
        label: tasksCount
          ? tPlural(t, 'bookkeeping:label.count_tasks', {
            count: tasksCount,
            displayCount: formatNumber(tasksCount),
            one: '{{displayCount}} task',
            other: '{{displayCount}} tasks',
          })
          : undefined,
        labelShort: tasksCount ? formatNumber(tasksCount) : undefined,
        icon: <AlertCircle size={12} />,
      }
    }
    case BookkeepingPeriodStatus.CLOSED_COMPLETE: {
      return {
        color: 'success' as const,
        icon: <CheckCircle size={12} />,
      }
    }
    case BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE: {
      return
    }
    default: {
      return safeAssertUnreachable({
        value: status,
        message: 'Unexpected bookkeeping status in `TaskStatusBadge`',
        fallbackValue: undefined,
      })
    }
  }
}

export const TaskStatusBadge = ({ status, tasksCount }: TaskStatusBadgeProps) => {
  const badgeConfig = useBadgeConfig(status, tasksCount)
  const { isMobile } = useSizeClass()
  if (!badgeConfig) {
    return
  }
  const dataProperties = toDataProperties({ status: badgeConfig.color, icononly: !badgeConfig.label })

  return (
    <HStack className='Layer__TasksBadge' {...dataProperties}>
      <HStack align='center' justify='center' className='Layer__TasksBadge__Icon' data-status={badgeConfig.color}>
        {badgeConfig.icon}
      </HStack>
      <Text
        className='Layer__TasksBadge__Label'
        size={TextSize.sm}
        status={badgeConfig.color}
        invertColor={badgeConfig.color === 'warning'}
        weight={TextWeight.bold}
      >
        {isMobile ? badgeConfig.labelShort : badgeConfig.label}
      </Text>
    </HStack>
  )
}
