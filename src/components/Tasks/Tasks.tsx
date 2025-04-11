import { Loader } from '../Loader'
import { TasksHeader } from './TasksHeader'
import { TasksList } from './TasksList'
import { TasksPending } from './TasksPending'
import { TasksMonthSelector } from './TasksMonthSelector'
import classNames from 'classnames'
import { TasksPanelNotification } from './TasksPanelNotification'
import { TasksYearsTabs } from './TasksYearsTabs'
import { ConditionalBlock } from '../utility/ConditionalBlock'
import { TasksEmptyContainer } from './container/TasksEmptyContainer'
import { P } from '../ui/Typography/Text'
import { Heading } from '../ui/Typography/Heading'
import { VStack } from '../ui/Stack/Stack'
import { useBookkeepingPeriods } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'

export interface TasksStringOverrides {
  header?: string
}

type TasksProps = {
  /**
   * @deprecated Use `stringOverrides.header` instead
   */
  tasksHeader?: string
  mobile?: boolean
  stringOverrides?: TasksStringOverrides
}

export function Tasks({
  mobile = false,
  tasksHeader,
  stringOverrides,
}: TasksProps) {
  const { data, isLoading } = useBookkeepingPeriods()

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
