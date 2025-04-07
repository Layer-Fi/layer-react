import {
  ReactNode,
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
  mobile?: boolean
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
  mobile = false,
  tasksHeader, // deprecated
  stringOverrides,
}: {
  mobile?: boolean
  tasksHeader?: string
  stringOverrides?: TasksStringOverrides
}) => {
  const {
    data,
    isLoading,
  } = useTasksContext()

  return (
    <div className='Layer__tasks-component'>
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
              <TasksList mobile={mobile} />
            </>
          )}
      </div>
    </div>
  )
}
