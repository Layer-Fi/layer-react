import { Loader } from '../Loader'
import { TasksHeader } from './TasksHeader'
import { TasksList } from './TasksList'
import { TasksPending } from './TasksPending'
import { TasksMonthSelector } from './TasksMonthSelector'
import { TasksPanelNotification } from './TasksPanelNotification'
import { TasksYearsTabs } from './TasksYearsTabs'
import { ConditionalBlock } from '../utility/ConditionalBlock'
import { TasksEmptyContainer } from './container/TasksEmptyContainer'
import { P } from '../ui/Typography/Text'
import { Heading } from '../ui/Typography/Heading'
import { VStack } from '../ui/Stack/Stack'
import { useBookkeepingPeriods } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { Container } from '../Container'
import { TasksEmptyState } from './TasksEmptyState'
import { CallBookingPurpose, useCallBookings } from '../../features/callBookings/api/useCallBookings'
import { useMemo } from 'react'

export interface TasksStringOverrides {
  header?: string
}

type TasksState = 'loading' | 'onboarding' | 'active'

type TasksProps = {
  /**
   * @deprecated Use `stringOverrides.header` instead
   */
  tasksHeader?: string
  mobile?: boolean
  stringOverrides?: TasksStringOverrides
  onClickReconnectAccounts?: () => void
}

export function Tasks({
  mobile = false,
  tasksHeader,
  onClickReconnectAccounts,
  stringOverrides,
}: TasksProps) {
  const { data, isLoading } = useBookkeepingPeriods()
  const { data: callBookings, isLoading: isLoadingCallBookings } = useCallBookings()

  const tasksState: TasksState = useMemo(() => {
    if (isLoading || isLoadingCallBookings) {
      return 'loading'
    }

    const hasBookkeepingTasks = (data?.length ?? 0) > 0 && data?.some(period => period.tasks.length > 0)

    const hasOnboardingCallBooking = callBookings?.some(callBooking =>
      callBooking.data.some(callBooking => callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING)) ?? false

    if (hasOnboardingCallBooking && !hasBookkeepingTasks) {
      return 'onboarding'
    }

    return 'active'
  }, [callBookings, data, isLoading, isLoadingCallBookings])

  return (
    <Container name='tasks'>
      <TasksPanelNotification
        onClickReconnectAccounts={onClickReconnectAccounts}
      />
      <TasksHeader tasksHeader={stringOverrides?.header || tasksHeader} />
      <VStack className='Layer__tasks__content'>
        {tasksState === 'onboarding' && (
          <TasksEmptyState />
        )}
        {tasksState === 'active' && (
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
                  <P>If you believe this is an error, please contact support.</P>
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
        )}
      </VStack>
    </Container>
  )
}
