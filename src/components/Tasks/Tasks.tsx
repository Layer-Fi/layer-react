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
import { isComplete } from '../../types/tasks'
import { Loader } from '../Loader'
import { TasksHeader } from '../TasksHeader'
import { TasksList } from '../TasksList'
import { TasksPending } from '../TasksPending'
import { TasksMonthSelector } from '../TasksMonthSelector/TasksMonthSelector'
import classNames from 'classnames'
import { endOfYear, getYear, startOfYear } from 'date-fns'

export type UseTasksContextType = ReturnType<typeof useTasks>
export const UseTasksContext = createContext<UseTasksContextType>({
  data: undefined,
  isLoading: undefined,
  loadedStatus: 'initial',
  isValidating: undefined,
  error: undefined,
  refetch: () => {},
  submitResponseToTask: () => {},
  uploadDocumentsForTask: () => Promise.resolve(),
  deleteUploadsForTask: () => {},
  updateDocUploadTaskDescription: () => {},
  currentDate: new Date(),
  setCurrentDate: () => {},
  dateRange: { startDate: startOfYear(new Date()), endDate: endOfYear(new Date())},
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
    currentDate,
    setCurrentDate,
    dateRange
  } = useContext(TasksContext)

  const allComplete = useMemo(() => {
    if (!data) {
      return undefined
    }

    if (data && !isLoading) {
      return Boolean(data.every(x => isComplete(x.status)))
    }

    return false
  }, [data, isLoading])

  const [open, setOpen] = useState(
    defaultCollapsed || collapsedWhenComplete ? false : true,
  )

  useEffect(() => {
    if (
      allComplete
      && open
      && collapsedWhenComplete
      && loadedStatus === 'complete'
    ) {
      setOpen(false)
    }
  }, [allComplete])

  return (
    <div className='Layer__tasks-component'>
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
        {isLoading || !data ? (
          <div className='Layer__tasks__loader-container'>
            <Loader />
          </div>
        ) : (
          <>
            <TasksMonthSelector
              tasks={monthlyData}
              currentDate={currentDate}
              onClick={setCurrentDate}
              year={getYear(dateRange.startDate)}
            />
            <TasksPending />
            <TasksList />
          </>
        )}
      </div>
    </div>
  )
}
