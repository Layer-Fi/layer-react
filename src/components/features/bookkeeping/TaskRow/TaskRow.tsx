import { type ReactNode } from 'react'

import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { isCompletedTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { HStack, type StackProps, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { TaskStatusIcon } from '@features/bookkeeping/TaskStatusIcon/TaskStatusIcon'

import './taskRow.scss'

type TaskRowProps = {
  task: UnifiedAskFormTask
  slots?: {
    /** Replaces the status icon, such as a back button while a task is open. */
    Leading?: ReactNode
    /** Rendered after the title, such as an expand or navigate chevron. */
    Trailing?: ReactNode
  }
  slotProps?: {
    Stack?: Pick<StackProps, 'pi'>
  }
}

/** The one row for a task in every list: status circle, title, and whatever the list puts at the end. */
export const TaskRow = ({ task, slots, slotProps }: TaskRowProps) => (
  <HStack className='Layer__TaskRow' align='center' gap='xs' {...slotProps?.Stack} fluid {...toDataProperties({ completed: isCompletedTask(task) })}>
    {slots?.Leading ?? <TaskStatusIcon task={task} />}
    <VStack className='Layer__TaskRow__Text'>
      <Span className='Layer__TaskRow__Title' variant='inherit' ellipsis>{task.title}</Span>
      {task.subtitle ? <Span className='Layer__TaskRow__Subtitle' size='sm' variant='subtle' ellipsis>{task.subtitle}</Span> : null}
    </VStack>
    {slots?.Trailing ? <HStack className='Layer__TaskRow__Trailing' align='center'>{slots.Trailing}</HStack> : null}
  </HStack>
)
