import { Check, CircleAlert } from 'lucide-react'

import { type BusinessTask, BusinessTaskStatus } from '@schemas/businessTasks/businessTask'

const STATUS_TO_ICON_MAP = {
  [BusinessTaskStatus.Todo]: {
    icon: <CircleAlert size={12} />,
  },
  [BusinessTaskStatus.UserMarkedCompleted]: {
    icon: <Check size={12} />,
  },
  [BusinessTaskStatus.Completed]: {
    icon: null,
  },
  [BusinessTaskStatus.Archived]: {
    icon: null,
  },
} as const

export function getIconForTask(task: Pick<BusinessTask, 'status'>) {
  return STATUS_TO_ICON_MAP[task.status].icon
}
