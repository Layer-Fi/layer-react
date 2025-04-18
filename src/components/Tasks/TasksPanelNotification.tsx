import pluralize from 'pluralize'
import { useBookkeepingYearsStatus } from '../../hooks/bookkeeping/periods/useBookkeepingYearsStatus'
import AlertCircle from '../../icons/AlertCircle'
import ArrowRightCircle from '../../icons/ArrowRightCircle'
import { Text, TextSize, TextWeight } from '../Typography/Text'
import { useGlobalDatePeriodAlignedActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export const TasksPanelNotification = () => {
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()
  const { anyPreviousYearIncomplete, earliestIncompletePeriod } = useBookkeepingYearsStatus()

  if (!anyPreviousYearIncomplete || !earliestIncompletePeriod) {
    return null
  }

  return (
    <div className='Layer__tasks-header__notification'>
      <div className='Layer__tasks-header__notification__text'>
        <Text status='warning' invertColor>
          <AlertCircle size={11} />
        </Text>
        <Text size={TextSize.sm} weight={TextWeight.bold} status='warning' invertColor>
          {pluralize('open task', anyPreviousYearIncomplete.unresolvedTasks, true)}
          {' in '}
          {anyPreviousYearIncomplete.year}
        </Text>
      </div>
      <button
        className='Layer__tasks-header__notification__button'
        onClick={() => {
          setMonthByPeriod({
            monthNumber: earliestIncompletePeriod.month,
            yearNumber: earliestIncompletePeriod.year,
          })
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
