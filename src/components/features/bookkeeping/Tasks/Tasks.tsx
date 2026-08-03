import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useGetBookkeepingPeriods } from '@api/businesses/[business-id]/bookkeeping/periods/get'
import { CallBookingPurpose, useGetListCallBookings } from '@api/businesses/[business-id]/call-bookings/get'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Loader } from '@ui/Loader/Loader'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { P, Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { TasksEmptyContainer } from '@features/bookkeeping/Tasks/TasksEmptyContainer'
import { TasksHeader } from '@features/bookkeeping/Tasks/TasksHeader'
import { TasksPanelNotification } from '@features/bookkeeping/Tasks/TasksPanelNotification'
import { TasksPending } from '@features/bookkeeping/Tasks/TasksPending'
import { TasksYearsTabs } from '@features/bookkeeping/Tasks/TasksYearsTabs'
import { TasksList } from '@features/bookkeeping/TasksList/TasksList'
import { TasksMonthSelector } from '@features/bookkeeping/TasksMonthSelector/TasksMonthSelector'

import './tasks.scss'

const TasksOnboardingEmptyState = () => {
  const { t } = useTranslation()
  return (
    <VStack gap='lg' pi='md' pbe='md'>
      <Span>{t('bookkeeping:label.complete_bookkeeping_onboarding_call', 'Once you complete your bookkeeping onboarding call, you will see your bookkeeping tasks here.')}</Span>
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
  const { t } = useTranslation()
  const { data, isLoading } = useGetBookkeepingPeriods()
  const { flattenedData: callBookings, isLoading: isLoadingCallBookings } = useGetListCallBookings()
  const { isMobile } = useSizeClass()

  const tasksState: TasksState = useMemo(() => {
    if (isLoading || isLoadingCallBookings) {
      return 'loading'
    }

    const hasBookkeepingTasks = (data?.length ?? 0) > 0 && data?.some(period => period.tasks.length > 0)

    const hasOnboardingCallBooking = callBookings?.some(
      callBooking => callBooking.purpose === CallBookingPurpose.BOOKKEEPING_ONBOARDING,
    ) ?? false

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
                    {t('bookkeeping:label.not_enrolled_in_bookkeeping', 'Not Enrolled in Bookkeeping')}
                  </Heading>
                  <P>{t('bookkeeping:label.please_contact_support', 'If you believe this is an error, please contact support.')}</P>
                </VStack>
              </TasksEmptyContainer>
            )}
          >
            {() => (
              <>
                <TasksYearsTabs isMobile={isMobile} />
                <TasksMonthSelector isMobile={isMobile} />
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
