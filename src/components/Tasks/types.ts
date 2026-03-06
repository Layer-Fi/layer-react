import type { UserVisibleTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { type BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'

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
