import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
// import { useTasks } from '../../hooks/useTasks'
import { Loader } from '../Loader'
import { TasksHeader } from './TasksHeader'
import { TasksList } from './TasksList'
import { TasksPending } from './TasksPending'
import { TasksMonthSelector } from './TasksMonthSelector'
import classNames from 'classnames'
import { getYear } from 'date-fns'
import { useBookkeepingPeriods } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { TasksPanelNotification } from './TasksPanelNotification'
import { TasksYearsTabs } from './TasksYearsTabs'
import { useTasks } from '../../hooks/useTasks'
import { TasksContext, useTasksContext } from './TasksContext'

export interface TasksStringOverrides {
  header?: string
}

export type TasksProps = {
  tasksHeader?: string
  collapsable?: boolean
  defaultCollapsed?: boolean
  collapsedWhenComplete?: boolean
  stringOverrides?: TasksStringOverrides
}

export const Tasks = (props: TasksProps) => {
  return (
    <TasksProvider>
      <TasksComponent {...props} />
    </TasksProvider>
  )
}

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const contextData = useTasks()

  return (
    <TasksContext.Provider value={contextData}>
      {children}
    </TasksContext.Provider>
  )
}

export const TasksComponent = ({
  collapsable = false,
  defaultCollapsed = false,
  collapsedWhenComplete,
  tasksHeader, // deprecated
  stringOverrides,
}: {
  tasksHeader?: string
  collapsable?: boolean
  defaultCollapsed?: boolean
  collapsedWhenComplete?: boolean
  stringOverrides?: TasksStringOverrides
}) => {
  // const {
  //   isLoading,
  //   loadedStatus,
  //   data,
  //   monthlyData,
  //   yearlyData,
  //   currentDate,
  //   setCurrentDate,
  //   dateRange,
  //   unresolvedTasks,
  // } = useContext(TasksContext)

  // const allComplete = useMemo(() => {
  //   if (isLoading || !data || unresolvedTasks === undefined) {
  //     return undefined
  //   }

  //   if (!isLoading && unresolvedTasks === 0) {
  //     return true
  //   }

  //   return false
  // }, [data, isLoading, unresolvedTasks])

  const {
    data,
    isLoading,
    currentDate,
    setCurrentDate,
  } = useTasksContext()

  const allComplete = false

  const [open, setOpen] = useState(
    collapsable && allComplete === false ? true : defaultCollapsed || collapsedWhenComplete ? false : true,
  )

  const { data: bookkeepingPeriods } = useBookkeepingPeriods()

  const periodData = useMemo(() => {
    const currentMonthNumber = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    return bookkeepingPeriods?.find(
      period => period.year === currentYear && period.month === currentMonthNumber,
    )
  }, [bookkeepingPeriods, currentDate])

  const bookkeepingMonthStatus = periodData?.status

  useEffect(() => {
    if (collapsable && allComplete === false) {
      setOpen(true)
      return
    }

    if (
      allComplete
      && open
      && collapsedWhenComplete
      && !isLoading
    ) {
      setOpen(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allComplete])

  return (
    <div
      className={classNames(
        'Layer__tasks-component',
        collapsable && 'Layer__tasks-component--collapsable',
      )}
    >
      <TasksPanelNotification />
      <TasksHeader
        tasksHeader={stringOverrides?.header || tasksHeader}
        collapsable={collapsable}
        open={open}
        toggleContent={() => setOpen(!open)}
      />
      <div
        className={classNames(
          'Layer__tasks__content',
          !open && 'Layer__tasks__content--collapsed',
        )}
      >
        {isLoading || !data
          ? (
            <div className='Layer__tasks__loader-container'>
              <Loader />
            </div>
          )
          : (
            <>
              <TasksYearsTabs />
              <TasksMonthSelector
                tasks={bookkeepingPeriods}
                currentDate={currentDate}
                onClick={setCurrentDate}
                year={getYear(currentDate)}
              />
              <TasksPending
                bookkeepingMonthStatus={bookkeepingMonthStatus}
              />
              <TasksList />
            </>
          )}
      </div>
    </div>
  )
}
