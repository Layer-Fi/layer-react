import React, { useContext } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import { useTasks } from '../../hooks/useTasks'
import { Container } from '../Container'
import { Loader } from '../Loader'
import { TasksHeader } from '../TasksHeader'
import { TasksList } from '../TasksList'
import { TasksPending } from '../TasksPending'

export const Tasks = ({ asContainer = true }: { asContainer?: boolean }) => {
  const contextData = useTasks()

  return (
    <TasksContext.Provider value={contextData}>
      {asContainer ? (
        <Container name='tasks-component'>
          <TasksComponent />
        </Container>
      ) : (
        <div className='Layer__tasks-component'>
          <TasksComponent />
        </div>
      )}
    </TasksContext.Provider>
  )
}

export const TasksComponent = () => {
  const { isLoading, data } = useContext(TasksContext)

  return (
    <>
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
    </>
  )
}
