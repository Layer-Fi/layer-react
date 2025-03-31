import {
  ReactNode,
  useEffect,
  useState,
} from 'react'
import { Loader } from '../Loader'
import { TasksHeader } from './TasksHeader'
import { TasksList } from './TasksList'
import { TasksPending } from './TasksPending'
import { TasksMonthSelector } from './TasksMonthSelector'
import classNames from 'classnames'
import { TasksPanelNotification } from './TasksPanelNotification'
import { TasksYearsTabs } from './TasksYearsTabs'
import { TasksContext, useTasksContext } from './TasksContext'
import { useTasks } from '../../hooks/useTasks'

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
  const {
    data,
    isLoading,
  } = useTasksContext()

  const allComplete = false

  const [open, setOpen] = useState(
    collapsable && allComplete === false ? true : defaultCollapsed || collapsedWhenComplete ? false : true,
  )

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
      <TasksHeader tasksHeader={stringOverrides?.header || tasksHeader} />
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
              <TasksMonthSelector />
              <TasksPending />
              <TasksList />
            </>
          )}
      </div>
    </div>
  )
}
