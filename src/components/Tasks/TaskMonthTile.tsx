import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { TaskStatusBadge } from '@components/Tasks/TaskStatusBadge'
import { type MonthData } from '@components/Tasks/types'
import { Text, TextSize } from '@components/Typography/Text'

export type TaskMonthTileProps = {
  data: MonthData
  active?: boolean
  disabled?: boolean
  onClick: (date: Date) => void
}

export const TaskMonthTile = ({ data, onClick, active, disabled }: TaskMonthTileProps) => {
  const dataProperties = toDataProperties({ active, disabled })

  return (
    <div
      className='Layer__tasks-month-selector__month'
      onClick={() => !disabled && onClick(new Date(data.year, data.month - 1, 1))}
      {...dataProperties}
    >
      <Text size={TextSize.sm} className='Layer__tasks-month-selector__month__str'>
        {data.monthStr}
      </Text>
      {data.status && (
        <TaskStatusBadge status={data.status} tasksCount={data.total - data.completed} />
      )}
    </div>
  )
}
