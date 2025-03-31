import { TaskMonthTileProps } from './types'
import { Text, TextSize } from '../Typography'
import { TaskStatusBadge } from './TaskStatusBadge'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'

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
