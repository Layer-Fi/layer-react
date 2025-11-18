import { useMemo } from 'react'
import { getYear } from 'date-fns'

import { isIncompleteTask, type UserVisibleTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { getActivationDate } from '@utils/business'
import { useBookkeepingPeriods } from '@hooks/bookkeeping/periods/useBookkeepingPeriods'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
      .filter(({ year }) => data?.some(period => period.year === year))
      .sort((a, b) => b.year - a.year)
  }, [activationDate, data])

  const earliestIncompletePeriod = useMemo(() => [...(data ?? [])]
    .sort((a, b) => {
      if (a.year === b.year) {
        return b.month - a.month
      }

      return b.year - a.year
    })
    .find(period => period.tasks.some(task => isIncompleteTask(task))),
  [data])

  const anyPreviousYearIncomplete = yearStatuses?.find(year => !year.completed && year.year < new Date().getFullYear())

  return {
    yearStatuses,
    anyPreviousYearIncomplete,
    earliestIncompletePeriod,
    isLoading,
  }
}
