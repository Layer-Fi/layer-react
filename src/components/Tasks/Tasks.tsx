import React, { useContext } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import { useTasks } from '../../hooks/useTasks'
import { Container } from '../Container'
import { Loader } from '../Loader'
import { TasksHeader } from '../TasksHeader'
import { TasksList } from '../TasksList'
import { TasksPending } from '../TasksPending'

export const Tasks = () => {
  const contextData = useTasks()

  return (
    <TasksContext.Provider value={contextData}>
      <TasksComponent />
    </TasksContext.Provider>
  )
}

export const TasksComponent = () => {
  const { isLoading, data } = useContext(TasksContext)

  return (
    <Container name='tasks-component'>
      <TasksHeader />
      {isLoading || !data ? (
        <div className={`Layer__tasks__loader-container`}>
          <Loader />
        </div>
      ) : (
        <>
          {data.length > 0 && <TasksPending />}
          <TasksList />
        </>
      )}
    </Container>
  )
}
