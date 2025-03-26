import { BookkeepingPeriod } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { Task } from '../../types/tasks'

export type TasksMonthSelectorProps = {
  // tasks?: TasksMonthly[]
  tasks?: BookkeepingPeriod[]
  currentDate: Date
  year: number
  onClick: (date: Date) => void
}

export type MonthData = {
  year: number
  month: number
  total: number
  completed: number
  tasks: Task[]
  monthStr: string
  startDate: Date
  endDate: Date
  disabled?: boolean
}

export type TaskMonthTileProps = {
  data: BookkeepingPeriod
  active?: boolean
  disabled?: boolean
  onClick: TasksMonthSelectorProps['onClick']
}
