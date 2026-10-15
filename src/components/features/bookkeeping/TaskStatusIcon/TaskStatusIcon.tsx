import { Check, CircleAlert } from 'lucide-react'

import { type BusinessTask } from '@schemas/features/bookkeeping/businessTask'
import { isCompletedTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { HStack } from '@ui/Stack/Stack'

import './taskStatusIcon.scss'

/** A task's status as a check or alert in a circle of the matching colour. */
export const TaskStatusIcon = ({ task }: { task: Pick<BusinessTask, 'status'> }) => {
  const isCompleted = isCompletedTask(task)

  return (
    <HStack className='Layer__TaskStatusIcon' align='center' justify='center' {...toDataProperties({ status: isCompleted ? 'success' : 'warning' })}>
      {isCompleted ? <Check size={12} /> : <CircleAlert size={12} />}
    </HStack>
  )
}
