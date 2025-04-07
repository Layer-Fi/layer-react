import { startOfMonth } from 'date-fns'
import { useBookkeepingYearsStatus } from '../../hooks/bookkeeping/periods/useBookkeepingYearsStatus'
import AlertCircle from '../../icons/AlertCircle'
import ArrowRightCircle from '../../icons/ArrowRightCircle'
import { useGlobalDateRangeActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { Text, TextSize, TextWeight } from '../Typography/Text'
import { findLatestUnresolvedTask } from './utils'

type BookkeepingStatusPanelNotificationProps = {
  onClick?: () => void
}

export const BookkeepingStatusPanelNotification = ({ onClick }: BookkeepingStatusPanelNotificationProps) => {
  const { setMonth } = useGlobalDateRangeActions()
  const { anyPreviousYearIncomplete } = useBookkeepingYearsStatus()

  if (!anyPreviousYearIncomplete) {
    return null
  }

  return (
    <div className='Layer__tasks-header__notification'>
      <div className='Layer__tasks-header__notification__text'>
        <Text status='warning' invertColor>
          <AlertCircle size={11} />
        </Text>
        <Text size={TextSize.sm} weight={TextWeight.bold} status='warning' invertColor>
          {anyPreviousYearIncomplete.unresolvedTasks}
          {' '}
          open tasks in
          {' '}
          {anyPreviousYearIncomplete.year}
        </Text>
      </div>
      {onClick && (
        <button
          className='Layer__tasks-header__notification__button'
          onClick={() => {
            const refDate = findLatestUnresolvedTask(anyPreviousYearIncomplete?.tasks ?? [])?.effective_date
            if (!refDate) {
              return
            }

            setMonth({ start: startOfMonth(new Date(refDate)) })
            onClick?.()
          }}
        >
          <Text size={TextSize.sm} weight={TextWeight.bold}>
            View and complete
          </Text>
          <ArrowRightCircle size={14} />
        </button>
      )}
    </div>
  )
}
