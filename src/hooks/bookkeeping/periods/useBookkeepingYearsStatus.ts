import { useMemo } from 'react'
import { useBookkeepingPeriods } from './useBookkeepingPeriods'
import { useLayerContext } from '../../../contexts/LayerContext/LayerContext'
import { getActivationDate } from '../../../utils/business'
import { getYear } from 'date-fns'
import { isIncompleteTask, type UserVisibleTask } from '../../../utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { isActiveBookkeepingPeriod } from '../../../utils/bookkeeping/periods/getFilteredBookkeepingPeriods'

export const useBookkeepingYearsStatus = () => {
  const { business } = useLayerContext()
  const activationDate = getActivationDate(business)

  const { data, isLoading } = useBookkeepingPeriods()

  const yearStatuses = useMemo(() => {
    const startYear = getYear(activationDate ?? new Date())
    const currentYear: number = new Date().getFullYear()
    const count: number = currentYear - startYear + 1

    return Array.from({ length: count }, (_, index) => ({ year: startYear + index }))
      .map(({ year }) => {
        const tasks = data
          ?.filter(period => period.year === year)
          .reduce((acc, period) => acc.concat(period.tasks), [] as Array<UserVisibleTask>)

        const unresolvedTaskCount = tasks?.filter(task => isIncompleteTask(task)).length

        return {
          year,
          tasks,
          unresolvedTasks: unresolvedTaskCount,
          completed: unresolvedTaskCount === 0,
        }
      })
      .filter(({ year }) => data?.some(period => period.year === year && isActiveBookkeepingPeriod(period)))
      .sort((a, b) => b.year - a.year)
  }, [activationDate, data])

  const anyPreviousYearIncomplete = yearStatuses?.find(year => !year.completed && year.year < new Date().getFullYear())

  return { yearStatuses, anyPreviousYearIncomplete, isLoading }
}
