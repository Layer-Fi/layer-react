import React from 'react'
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
      <Container name='tasks-component'>
        <TasksHeader />
        {contextData?.isLoading || !contextData.data ? (
          <div className={`Layer__tasks__loader-container`}>
            <Loader />
          </div>
        ) : (
          <>
            {contextData.data.length > 0 && <TasksPending />}
            <TasksList />
          </>
        )}
      </Container>
    </TasksContext.Provider>
  )
}
