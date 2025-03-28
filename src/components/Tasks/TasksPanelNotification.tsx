import { useBookkeepingYearsStatus } from '../../hooks/bookkeeping/periods/useBookkeepingYearsStatus'
import AlertCircle from '../../icons/AlertCircle'
import ArrowRightCircle from '../../icons/ArrowRightCircle'
import { Text, TextSize, TextWeight } from '../Typography/Text'
import { useTasksContext } from './TasksContext'

export const TasksPanelNotification = () => {
  const { currentMonthDate, setCurrentMonthDate } = useTasksContext()
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
      <button
        className='Layer__tasks-header__notification__button'
        onClick={() => {
          const date = new Date(currentMonthDate)
          date.setFullYear(anyPreviousYearIncomplete.year)
          setCurrentMonthDate(date)
        }}
      >
        <Text size={TextSize.sm} weight={TextWeight.bold}>
          View and complete
        </Text>
        <ArrowRightCircle size={14} />
      </button>
    </div>
  )
}
