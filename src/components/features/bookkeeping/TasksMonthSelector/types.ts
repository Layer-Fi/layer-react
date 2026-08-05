import { type BookkeepingPeriodStatus } from '@schemas/bookkeeping/bookkeepingPeriods'
import type { UserVisibleTask } from '@utils/features/bookkeeping/bookkeepingTasksFilters'

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
