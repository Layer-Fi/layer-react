import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import { useTasks } from '../../hooks/useTasks'
import { Loader } from '../Loader'
import { TasksHeader } from '../TasksHeader'
import { TasksList } from '../TasksList'
import { TasksPending } from '../TasksPending'
import { TasksMonthSelector } from '../TasksMonthSelector/TasksMonthSelector'
import classNames from 'classnames'
import { endOfYear, getYear, startOfYear } from 'date-fns'
import { useBookkeepingPeriods } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'

export type UseTasksContextType = ReturnType<typeof useTasks>
export const UseTasksContext = createContext<UseTasksContextType>({
  data: undefined,
  isLoading: undefined,
  loadedStatus: 'initial',
  isValidating: undefined,
  error: undefined,
  refetch: () => Promise.resolve({ data: [] }),
  submitResponseToTask: () => {},
  uploadDocumentsForTask: () => Promise.resolve(),
  deleteUploadsForTask: () => {},
  updateDocUploadTaskDescription: () => {},
  currentDate: new Date(),
  setCurrentDate: () => {},
  dateRange: { startDate: startOfYear(new Date()), endDate: endOfYear(new Date()) },
  setDateRange: () => {},
})

export const useTasksContext = () => useContext(UseTasksContext)

export interface TasksStringOverrides {
  header?: string
}

export const Tasks = ({
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
  return (
    <TasksProvider>
      <TasksComponent
        collapsable={collapsable}
        defaultCollapsed={defaultCollapsed}
        collapsedWhenComplete={collapsedWhenComplete}
        tasksHeader={tasksHeader} // deprecated
        stringOverrides={stringOverrides}
      />
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
  const {
    isLoading,
    loadedStatus,
    data,
    monthlyData,
    yearlyData,
    currentDate,
    setCurrentDate,
    dateRange,
    unresolvedTasks,
  } = useContext(TasksContext)

  const allComplete = useMemo(() => {
    if (isLoading || !data || unresolvedTasks === undefined) {
      return undefined
    }

    if (!isLoading && unresolvedTasks === 0) {
      return true
    }

    return false
  }, [data, isLoading, unresolvedTasks])

  const [open, setOpen] = useState(
    collapsable && allComplete === false ? true : defaultCollapsed || collapsedWhenComplete ? false : true,
  )

  const { data: bookkeepingPeriods } = useBookkeepingPeriods()

  const bookkeepingMonthStatus = useMemo(() => {
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    return bookkeepingPeriods?.find(
      period => period.year === currentYear && period.month === currentMonth,
    )?.status
  }, [bookkeepingPeriods, currentDate])

  useEffect(() => {
    if (collapsable && allComplete === false) {
      setOpen(true)
      return
    }

    if (
      allComplete
      && open
      && collapsedWhenComplete
      && loadedStatus === 'complete'
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
      <TasksHeader
        tasksHeader={stringOverrides?.header || tasksHeader}
        collapsable={collapsable}
        open={open}
        toggleContent={() => setOpen(!open)}
        highlightYears={yearlyData?.map(x => x.year)}
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
              <TasksMonthSelector
                tasks={monthlyData}
                currentDate={currentDate}
                onClick={setCurrentDate}
                year={getYear(dateRange.startDate)}
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
