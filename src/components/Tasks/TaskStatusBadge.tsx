import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'
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

type BadgeColor = 'info' | 'warning' | 'success'

type BadgeConfig = {
  color: BadgeColor
  icon: ReactNode
  label?: string
  labelShort?: string
}

const buildLongLabel = (
  t: TFunction,
  formatNumber: (n: number) => string,
  tasksCount: number,
) =>
  tPlural(t, 'bookkeeping:label.count_tasks', {
    count: tasksCount,
    displayCount: formatNumber(tasksCount),
    one: '{{displayCount}} task',
    other: '{{displayCount}} tasks',
  })

const getBadgeConfig = (
  status: TaskStatusBadgeProps['status'],
  tasksCount: TaskStatusBadgeProps['tasksCount'],
  t: TFunction,
  formatNumber: (n: number) => string,
): BadgeConfig | undefined => {
  switch (status) {
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER:
    case BookkeepingPeriodStatus.NOT_STARTED:
    case BookkeepingPeriodStatus.CLOSING_IN_REVIEW: {
      return {
        color: 'info',
        icon: <Clock size={12} />,
        label: tasksCount ? buildLongLabel(t, formatNumber, tasksCount) : undefined,
        labelShort: tasksCount ? formatNumber(tasksCount) : undefined,
      }
    }
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER:
    case BookkeepingPeriodStatus.CLOSED_OPEN_TASKS: {
      return {
        color: 'warning',
        icon: <AlertCircle size={12} />,
        label: tasksCount ? buildLongLabel(t, formatNumber, tasksCount) : undefined,
        labelShort: tasksCount ? formatNumber(tasksCount) : undefined,
      }
    }
    case BookkeepingPeriodStatus.CLOSED_COMPLETE: {
      return {
        color: 'success',
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

type BadgeContentProps = {
  color: BadgeColor
  icon: ReactNode
  display?: string
}

const BadgeContent = ({ color, icon, display }: BadgeContentProps) => {
  const dataProperties = toDataProperties({ status: color, icononly: !display })

  return (
    <HStack className='Layer__TasksBadge' {...dataProperties}>
      <HStack align='center' justify='center' className='Layer__TasksBadge__Icon' data-status={color}>
        {icon}
      </HStack>
      {display
        ? (
          <Text
            className='Layer__TasksBadge__Label'
            size={TextSize.sm}
            status={color}
            invertColor={color === 'warning'}
            weight={TextWeight.bold}
          >
            {display}
          </Text>
        )
        : null}
    </HStack>
  )
}

export const TaskStatusBadge = ({ status, tasksCount }: TaskStatusBadgeProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { isMobile } = useSizeClass()

  const badgeConfig = getBadgeConfig(status, tasksCount, t, formatNumber)
  if (!badgeConfig) {
    return
  }

  const display = isMobile ? badgeConfig.labelShort : badgeConfig.label

  return <BadgeContent color={badgeConfig.color} icon={badgeConfig.icon} display={display} />
}
