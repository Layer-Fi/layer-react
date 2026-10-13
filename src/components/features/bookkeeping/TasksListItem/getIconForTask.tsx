import { Check, CircleAlert } from 'lucide-react'

import { type BusinessTask } from '@schemas/features/bookkeeping/businessTask'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

const STATUS_TO_ICON_MAP = {
  [BusinessTaskStatus.Todo]: {
    icon: <CircleAlert size={12} />,
  },
  [BusinessTaskStatus.UserMarkedCompleted]: {
    icon: <Check size={12} />,
  },
  [BusinessTaskStatus.Completed]: {
    icon: <Check size={12} />,
  },
  [BusinessTaskStatus.Archived]: {
    icon: <Check size={12} />,
  },
} as const

export function getIconForTask(task: Pick<BusinessTask, 'status'>) {
  return STATUS_TO_ICON_MAP[task.status].icon
}
