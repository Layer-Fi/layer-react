import { BookkeepingPeriodStatus } from '@schemas/bookkeepingPeriods'
import type { UserVisibleTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'

export type MonthData = {
  monthStr: string
  date: Date
  year: number
  month: number
  total: number
  completed: number
  status?: BookkeepingPeriodStatus
  disabled?: boolean
  tasks: ReadonlyArray<UserVisibleTask>
}
