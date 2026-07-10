import { useMemo } from 'react'
import { getMonth } from 'date-fns'

import { BookkeepingPeriodStatus } from '@schemas/bookkeepingPeriods'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useBookkeepingYearsStatus } from '@hooks/features/bookkeeping/useBookkeepingYearsStatus'
import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDate, useGlobalDatePeriodAlignedActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { LayerEventComponent, LayerEventType } from '@providers/LayerProvider/layerEvents'
import { Tabs } from '@components/Tabs/Tabs'
import { TaskStatusBadge } from '@components/Tasks/TaskStatusBadge'

type TasksYearsTabsProps = {
  isMobile: boolean
}

export const TasksYearsTabs = ({ isMobile }: TasksYearsTabsProps) => {
  const { date } = useGlobalDate()
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()
  const { formatDate } = useIntlFormatter()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.Tasks)

  const activeYear = date.getFullYear()

  const { yearStatuses } = useBookkeepingYearsStatus()

  const setCurrentYear = (year: string) => {
    const currentMonth = getMonth(date)

    emitLayerEvent({
      type: LayerEventType.TaskYearSelected,
      version: 1,
      payload: { year: Number(year) },
    })

    setMonthByPeriod({
      monthNumber: currentMonth + 1,
      yearNumber: Number(year),
    })
  }

  const yearsList = useMemo(() => {
    return yearStatuses?.sort((a, b) => a.year - b.year)
      .map((y) => {
        return {
          value: `${y.year}`,
          label: formatDate(new Date(y.year, 0, 1), DateFormat.Year),
          badge: !y.completed && y.unresolvedTasks
            ? (
              <TaskStatusBadge
                status={y.unresolvedTasks ? BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER : BookkeepingPeriodStatus.CLOSED_COMPLETE}
                tasksCount={y.unresolvedTasks}
                isMobile={isMobile}
              />
            )
            : null,

        }
      })
  }, [formatDate, yearStatuses, isMobile])

  return (
    <Tabs
      name='bookkeeping-year'
      options={yearsList}
      selected={activeYear.toString()}
      onChange={year => setCurrentYear(year.target.value)}
    />
  )
}
