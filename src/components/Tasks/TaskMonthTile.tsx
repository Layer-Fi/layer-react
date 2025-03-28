import { TaskMonthTileProps } from './types'
import classNames from 'classnames'
import { Text, TextSize } from '../Typography'
import CheckIcon from '../../icons/Check'
import AlertCircle from '../../icons/AlertCircle'
import { isComplete } from '../../types/tasks'

const TaskMonthTile = ({ data, onClick, active, disabled }: TaskMonthTileProps) => {
  const completedTasks = data.tasks?.filter(task => isComplete(task.status)).length
  const allTasks = data.tasks?.length
  const isCompleted = completedTasks === allTasks

  const baseClass = classNames(
    'Layer__tasks-month-selector__month',
    isCompleted && 'Layer__tasks-month-selector__month--completed',
    active && 'Layer__tasks-month-selector__month--active',
    disabled && 'Layer__tasks-month-selector__month--disabled',
  )

  return (
    <div className={baseClass} onClick={() => !disabled && onClick(new Date(data.year, data.month - 1, 1))}>
      <Text size={TextSize.sm} className='Layer__tasks-month-selector__month__str'>
        {data.monthStr}
      </Text>
      <Text size={TextSize.sm} className='Layer__tasks-month-selector__month__total'>
        {allTasks > 0 && isCompleted
          ? (
            allTasks
          )
          : ''}
      </Text>
      {isCompleted && allTasks > 0
        ? (
          <span className='Layer__tasks-month-selector__month__completed'>
            <CheckIcon size={12} />
          </span>
        )
        : null}
      {!isCompleted && allTasks > 0
        ? (
          <span className='Layer__tasks-month-selector__month__incompleted'>
            <Text size={TextSize.sm}>{allTasks - completedTasks}</Text>
            <AlertCircle size={12} />
          </span>
        )
        : null}
    </div>
  )
}

export { TaskMonthTile }
