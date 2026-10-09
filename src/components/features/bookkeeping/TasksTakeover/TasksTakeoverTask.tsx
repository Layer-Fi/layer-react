import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type UnifiedAskFormSubmissionResult } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/unifiedAskFormSubmissionResult'
import { findNextIncompleteTask, type UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { BackButton } from '@ui/Button/BackButton'
import { Button } from '@ui/Button/Button'
import { CloseButton } from '@ui/Button/CloseButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { UnifiedAskForm } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskForm'
import { useUnifiedAskForm } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { useUnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'

type TasksTakeoverTaskProps = {
  task: UserVisibleTask
  tasks: ReadonlyArray<UserVisibleTask>
  onTaskChange: (taskId: string | null) => void
}

export const TasksTakeoverTask = ({ task, tasks, onTaskChange }: TasksTakeoverTaskProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { eventCallbacks } = useLayerContext()
  const nextTaskId = findNextIncompleteTask(tasks, task.id)?.id ?? null

  const onSaved = useCallback(({ categorized }: UnifiedAskFormSubmissionResult) => {
    if (categorized) eventCallbacks?.onTransactionCategorized?.()
    onTaskChange(nextTaskId)
  }, [eventCallbacks, nextTaskId, onTaskChange])

  const { form, isSubmitting } = useUnifiedAskForm({ task, onSaved })
  const navigation = useUnifiedAskFormNavigation({ task, form })
  const isPending = isSubmitting || navigation.routing === 'loading'

  const slots = useMemo(() => ({
    FooterAction: nextTaskId
      ? (
        <Button variant='outlined' isDisabled={isPending} onPress={() => onTaskChange(nextTaskId)}>
          {t('bookkeeping:TasksTakeover.TasksTakeoverTask.action.skip', 'Skip')}
        </Button>
      )
      : null,
  }), [isPending, nextTaskId, onTaskChange, t])

  return (
    <VStack className='Layer__TasksTakeover'>
      <HStack className='Layer__TasksTakeover__Header' align='center' justify='space-between' gap='xs' pi='md'>
        <HStack className='Layer__TasksTakeover__HeaderSide'>
          {navigation.canGoBack
            ? <BackButton isDisabled={isPending} onPress={navigation.goBack} />
            : null}
        </HStack>
        <Span size='md' weight='bold'>
          {t('bookkeeping:TasksTakeover.TasksTakeoverTask.label.task_position', 'Task {{number}} of {{total}}', {
            number: formatNumber(tasks.indexOf(task) + 1),
            total: formatNumber(tasks.length),
          })}
        </Span>
        <HStack className='Layer__TasksTakeover__HeaderSide' justify='end'>
          <CloseButton isDisabled={isPending} onPress={() => onTaskChange(null)} />
        </HStack>
      </HStack>
      <VStack className='Layer__TasksTakeover__Body' gap='md' pbs='lg'>
        <VStack pi='md'>
          <Heading size='sm'>{task.title}</Heading>
        </VStack>
        <UnifiedAskForm task={task} form={form} navigation={navigation} isExpanded presentation='takeover' slots={slots} />
      </VStack>
    </VStack>
  )
}
