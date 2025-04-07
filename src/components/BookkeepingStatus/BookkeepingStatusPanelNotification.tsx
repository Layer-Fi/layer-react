import { startOfMonth } from 'date-fns'
import { useBookkeepingYearsStatus } from '../../hooks/bookkeeping/periods/useBookkeepingYearsStatus'
import AlertCircle from '../../icons/AlertCircle'
import ArrowRightCircle from '../../icons/ArrowRightCircle'
import { useGlobalDate, useGlobalDateRangeActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { Text, TextSize, TextWeight } from '../Typography/Text'

type BookkeepingStatusPanelNotificationProps = {
  onClick?: () => void
}

export const BookkeepingStatusPanelNotification = ({ onClick }: BookkeepingStatusPanelNotificationProps) => {
  const { date } = useGlobalDate()
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
            const newDate = new Date(date)
            newDate.setFullYear(anyPreviousYearIncomplete.year)
            setMonth({ start: startOfMonth(newDate) })
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
