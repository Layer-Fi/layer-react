import React, { useContext } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import { useTasks } from '../../hooks/useTasks'
import { Loader } from '../Loader'
import { TasksHeader } from '../TasksHeader'
import { TasksList } from '../TasksList'
import { TasksPending } from '../TasksPending'

export const Tasks = ({ tasksHeader }: { tasksHeader?: string }) => {
  const contextData = useTasks()

  return (
    <TasksContext.Provider value={contextData}>
      <div className='Layer__tasks-component'>
        <TasksComponent tasksHeader={tasksHeader} />
      </div>
    </TasksContext.Provider>
  )
}

export const TasksComponent = ({ tasksHeader }: { tasksHeader?: string }) => {
  const { isLoading, data } = useContext(TasksContext)

  return (
    <>
      <TasksHeader tasksHeader={tasksHeader} />
      {isLoading || !data ? (
        <div className={'Layer__tasks__loader-container'}>
          <Loader />
        </div>
      ) : (
        <>
          {data.length > 0 && <TasksPending />}
          <TasksList />
        </>
      )}
    </>
  )
}
