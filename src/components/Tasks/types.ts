import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { Task } from '../../types/tasks'

export type MonthData = {
  monthStr: string
  date: Date
  year: number
  month: number
  total: number
  completed: number
  status?: BookkeepingPeriodStatus
  disabled?: boolean
  tasks: Task[]
}

export type TaskMonthTileProps = {
  data: MonthData
  active?: boolean
  disabled?: boolean
  onClick: (date: Date) => void
}
