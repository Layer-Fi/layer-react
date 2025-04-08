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
import { ConditionalBlock } from '../utility/ConditionalBlock'
import { TasksEmptyContainer } from './container/TasksEmptyContainer'
import { P } from '../ui/Typography/Text'
import { Heading } from '../ui/Typography/Heading'
import { VStack } from '../ui/Stack/Stack'

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
        <ConditionalBlock
          data={data}
          isLoading={isLoading}
          Loading={(
            <TasksEmptyContainer>
              <Loader />
            </TasksEmptyContainer>
          )}
          Inactive={(
            <TasksEmptyContainer>
              <VStack gap='sm' align='center'>
                <Heading size='xs' level={4}>
                  Not Enrolled in Bookkeeping
                </Heading>
                <P>
                  If you believe this is an error, please contact support.
                </P>
              </VStack>
            </TasksEmptyContainer>
          )}
        >
          {() => (
            <>
              <TasksYearsTabs />
              <TasksMonthSelector />
              <TasksPending />
              <TasksList mobile={mobile} />
            </>
          )}
        </ConditionalBlock>
      </div>
    </div>
  )
}
