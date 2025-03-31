import { TaskMonthTileProps } from './types'
import classNames from 'classnames'
import { Text, TextSize } from '../Typography'
import { TaskStatusBadge } from './TaskStatusBadge'

export const TaskMonthTile = ({ data, onClick, active, disabled }: TaskMonthTileProps) => {
  const baseClass = classNames(
    'Layer__tasks-month-selector__month',
    active && 'Layer__tasks-month-selector__month--active',
    disabled && 'Layer__tasks-month-selector__month--disabled',
  )

  return (
    <div className={baseClass} onClick={() => !disabled && onClick(new Date(data.year, data.month - 1, 1))}>
      <Text size={TextSize.sm} className='Layer__tasks-month-selector__month__str'>
        {data.monthStr}
      </Text>
      {data.status && (
        <TaskStatusBadge status={data.status} tasksCount={data.total - data.completed} />
      )}
    </div>
  )
}
