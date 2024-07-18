import React, { useContext, useState } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import { useTasks } from '../../hooks/useTasks'
import { Loader } from '../Loader'
import { TasksHeader } from '../TasksHeader'
import { TasksList } from '../TasksList'
import { TasksPending } from '../TasksPending'
import classNames from 'classnames'

export const Tasks = ({
  tasksHeader,
  collapsable = false,
  defaultCollapsed = false,
}: {
  tasksHeader?: string
  collapsable?: boolean
  defaultCollapsed?: boolean
}) => {
  const contextData = useTasks()

  return (
    <TasksContext.Provider value={contextData}>
      <div className='Layer__tasks-component'>
        <TasksComponent
          tasksHeader={tasksHeader}
          collapsable={collapsable}
          defaultCollapsed={defaultCollapsed}
        />
      </div>
    </TasksContext.Provider>
  )
}

export const TasksComponent = ({
  tasksHeader,
  collapsable = false,
  defaultCollapsed = false,
}: {
  tasksHeader?: string
  collapsable?: boolean
  defaultCollapsed?: boolean
}) => {
  const { isLoading, data } = useContext(TasksContext)
  const [open, setOpen] = useState(defaultCollapsed ? false : true)

  return (
    <>
      <TasksHeader
        tasksHeader={tasksHeader}
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
            {data.length > 0 && <TasksPending />}
            <TasksList />
          </>
        )}
      </div>
    </>
  )
}
