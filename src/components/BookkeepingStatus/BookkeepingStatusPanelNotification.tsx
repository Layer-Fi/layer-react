import { useBookkeepingYearsStatus } from '../../hooks/bookkeeping/periods/useBookkeepingYearsStatus'
import AlertCircle from '../../icons/AlertCircle'
import ArrowRightCircle from '../../icons/ArrowRightCircle'
import { Text, TextSize, TextWeight } from '../Typography/Text'

type BookkeepingStatusPanelNotificationProps = {
  onClick?: () => void
}

export const BookkeepingStatusPanelNotification = ({ onClick }: BookkeepingStatusPanelNotificationProps) => {
  const { anyPreviousYearIncomplete } = useBookkeepingYearsStatus()

  if (!anyPreviousYearIncomplete) {
    return null
  }

  return (
    <div className='Layer__tasks-header__notification'>
      <div className='Layer__tasks-header__notification__text'>
        <Text size={TextSize.sm} status='warning' invertColor>
          <AlertCircle size={11} />
          {' '}
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
          onClick={onClick}
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
