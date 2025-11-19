import { useMemo } from 'react'

import { useBookkeepingPeriods } from '@hooks/bookkeeping/periods/useBookkeepingPeriods'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P, Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { Loader } from '@components/Loader/Loader'
import { TasksEmptyContainer } from '@components/Tasks/container/TasksEmptyContainer'
import { TasksHeader } from '@components/Tasks/TasksHeader'
import { TasksList } from '@components/Tasks/TasksList'
import { TasksMonthSelector } from '@components/Tasks/TasksMonthSelector'
import { TasksPanelNotification } from '@components/Tasks/TasksPanelNotification'
import { TasksPending } from '@components/Tasks/TasksPending'
import { TasksYearsTabs } from '@components/Tasks/TasksYearsTabs'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { CallBookingPurpose, useCallBookings } from '@features/callBookings/api/useCallBookings'

const TasksOnboardingEmptyState = () => {
  return (
    <VStack gap='lg' pi='md' pbe='md'>
      <Span>Once you complete your bookkeeping onboarding call, you will see your bookkeeping tasks here.</Span>
    </VStack>
  )
}

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
        {tasksState === 'loading' && (
          <TasksEmptyContainer>
            <Loader />
          </TasksEmptyContainer>
        )}
        {tasksState === 'onboarding' && (
          <TasksOnboardingEmptyState />
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
