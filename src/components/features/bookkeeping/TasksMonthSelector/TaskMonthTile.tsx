import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { P } from '@ui/Typography/Text'
import { type MonthData } from '@features/bookkeeping/TasksMonthSelector/types'
import { TaskStatusBadge } from '@features/bookkeeping/TaskStatusBadge/TaskStatusBadge'

import './taskMonthTile.scss'

export type TaskMonthTileProps = {
  data: MonthData
  active?: boolean
  disabled?: boolean
  isMobile: boolean
  onClick: (date: Date) => void
}

export const TaskMonthTile = ({ data, onClick, active, disabled, isMobile }: TaskMonthTileProps) => {
  const dataProperties = toDataProperties({ active, disabled })

  return (
    <div
      className='Layer__tasks-month-selector__month'
      onClick={() => !disabled && onClick(new Date(data.year, data.month - 1, 1))}
      {...dataProperties}
    >
      <P size='sm' status={disabled ? 'disabled' : undefined}>
        {data.monthStr}
      </P>
      {data.status && (
        <TaskStatusBadge status={data.status} tasksCount={data.total - data.completed} isMobile={isMobile} />
      )}
    </div>
  )
}
