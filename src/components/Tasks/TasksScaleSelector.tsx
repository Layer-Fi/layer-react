import { useMemo } from 'react'
import { Text, TextSize } from '@components/Typography/Text'
import { BookkeepingPeriodScale } from '@schemas/bookkeepingPeriods'
import { useTasksScale } from './TasksScaleContext'
import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { getYear } from 'date-fns'
import { useBookkeepingPeriods } from '@hooks/bookkeeping/periods/useBookkeepingPeriods'
import { getIncompleteTasks } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { TaskStatusBadge } from '@components/Tasks/TaskStatusBadge'

export function TasksScaleSelector() {
  const { selectedScale, setSelectedScale } = useTasksScale()
  const { date } = useGlobalDate()
  const { data } = useBookkeepingPeriods()
  const currentYear = getYear(date)

  const annualPeriod = useMemo(() => {
    return data?.find(period =>
      period.scale === BookkeepingPeriodScale.ANNUALLY && period.year === currentYear,
    )
  }, [data, currentYear])

  const annualIncompleteCount = useMemo(() => annualPeriod
    ? getIncompleteTasks(annualPeriod.tasks).length
    : 0, [annualPeriod])

  const handleScaleClick = (scale: BookkeepingPeriodScale) => {
    if (selectedScale === scale) {
      setSelectedScale(null)
    }
    else {
      setSelectedScale(scale)
    }
  }

  const showScaleSelector = selectedScale !== BookkeepingPeriodScale.ONGOING

  if (!showScaleSelector) {
    return null
  }

  if (!annualPeriod) {
    return null
  }

  return (
    <div className='Layer__tasks-scale-selector'>
      <div
        className={`Layer__tasks-scale-selector__option ${selectedScale === BookkeepingPeriodScale.ANNUALLY ? 'Layer__tasks-scale-selector__option--active' : ''}`}
        onClick={() => handleScaleClick(BookkeepingPeriodScale.ANNUALLY)}
      >
        <Text size={TextSize.sm}>
          {currentYear}
          {' '}
          Tasks
        </Text>
        {annualPeriod?.status && annualIncompleteCount > 0 && (
          <TaskStatusBadge status={annualPeriod.status} tasksCount={annualIncompleteCount} />
        )}
      </div>
    </div>
  )
}
