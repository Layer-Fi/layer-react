import type { RawTask } from '@internal-types/tasks'
import AlertCircle from '@icons/AlertCircle'
import Check from '@icons/Check'

const STATUS_TO_ICON_MAP = {
  TODO: {
    icon: <AlertCircle size={12} />,
  },
  USER_MARKED_COMPLETED: {
    icon: <Check size={12} />,
  },
  COMPLETED: {
    icon: null,
  },
  ARCHIVED: {
    icon: null,
  },
} as const

export function getIconForTask(task: Pick<RawTask, 'status'>) {
  return STATUS_TO_ICON_MAP[task.status].icon
}
