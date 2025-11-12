import { useMemo } from 'react'
import { Tabs } from '@components/Tabs/Tabs'
import { useBookkeepingYearsStatus } from '@hooks/bookkeeping/periods/useBookkeepingYearsStatus'
import { TaskStatusBadge } from '@components/Tasks/TaskStatusBadge'
import { useGlobalDate, useGlobalDatePeriodAlignedActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { getMonth } from 'date-fns'
import { BookkeepingPeriodStatus } from '@schemas/bookkeepingPeriods'
import { BookkeepingPeriodScale } from '@schemas/bookkeepingPeriods'
import { useContext } from 'react'
import { TasksScaleContext } from '@components/Tasks/TasksScaleContext'

export const TasksYearsTabs = () => {
  const { date } = useGlobalDate()
  const { setMonthByPeriod } = useGlobalDatePeriodAlignedActions()
  const scaleContext = useContext(TasksScaleContext)
  const setSelectedScale = scaleContext?.setSelectedScale

  const activeYear = date.getFullYear()

  const { yearStatuses, ongoingPeriod, ongoingIncompleteCount } = useBookkeepingYearsStatus()

  const hasOngoingTasks = ongoingPeriod && (ongoingPeriod.tasks?.length ?? 0) > 0

  const setCurrentYear = (year: string) => {
    const currentMonth = getMonth(date)

    setSelectedScale?.(null)
    setMonthByPeriod({
      monthNumber: currentMonth + 1,
      yearNumber: Number(year),
    })
  }

  const handleOngoingClick = () => {
    setSelectedScale?.(BookkeepingPeriodScale.ONGOING)
  }

  const selectedTab = useMemo(() => {
    if (scaleContext?.selectedScale === BookkeepingPeriodScale.ONGOING) {
      return 'ongoing'
    }
    return activeYear.toString()
  }, [scaleContext?.selectedScale, activeYear])

  const yearsList = useMemo(() => {
    return yearStatuses?.sort((a, b) => a.year - b.year)
      .map((y) => {
        return {
          value: `${y.year}`,
          label: `${y.year}`,
          badge: !y.completed && y.unresolvedTasks
            ? (
              <TaskStatusBadge
                status={y.unresolvedTasks ? BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER : BookkeepingPeriodStatus.CLOSED_COMPLETE}
                tasksCount={y.unresolvedTasks}
              />
            )
            : null,

        }
      }) ?? []
  }, [yearStatuses])

  const ongoingTab = useMemo(() => hasOngoingTasks
    ? [{
      value: 'ongoing',
      label: 'Ongoing Tasks',
      badge: ongoingIncompleteCount > 0 && ongoingPeriod?.status
        ? (
          <TaskStatusBadge
            status={ongoingPeriod.status}
            tasksCount={ongoingIncompleteCount}
          />
        )
        : null,
    }]
    : [], [hasOngoingTasks, ongoingIncompleteCount, ongoingPeriod?.status])

  const allTabs = useMemo(() => {
    return [...yearsList, ...ongoingTab]
  }, [yearsList, ongoingTab])

  const handleTabChange = (value: string) => {
    if (value === 'ongoing') {
      handleOngoingClick()
    }
    else {
      setCurrentYear(value)
    }
  }

  return (
    <Tabs
      name='bookkeeping-year'
      options={allTabs}
      selected={selectedTab}
      onChange={e => handleTabChange(e.target.value)}
    />
  )
}
