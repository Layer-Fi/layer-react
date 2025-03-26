import { TaskMonthTileProps } from './types'
import classNames from 'classnames'
import { Text, TextSize } from '../Typography'
import CheckIcon from '../../icons/Check'
import AlertCircle from '../../icons/AlertCircle'

/**
 * @TODO - data.tasks.length uses all tasks, not only incomplete
 */
const TaskMonthTile = ({ data, onClick, active, disabled }: TaskMonthTileProps) => {
  const isCompleted = data.status === 'CLOSED_COMPLETE' // @TODO - optimistically set
  const baseClass = classNames(
    'Layer__tasks-month-selector__month',
    isCompleted && 'Layer__tasks-month-selector__month--completed',
    active && 'Layer__tasks-month-selector__month--active',
    disabled && 'Layer__tasks-month-selector__month--disabled',
  )
  return (
    <div className={baseClass} onClick={() => !disabled && onClick(new Date(data.year, data.month, 1))}>
      <Text size={TextSize.sm} className='Layer__tasks-month-selector__month__str'>
        {data.month}
      </Text>
      <Text size={TextSize.sm} className='Layer__tasks-month-selector__month__total'>
        {data.tasks.length > 0 && isCompleted
          ? (
            data.tasks.length
          )
          : ''}
      </Text>
      {isCompleted && data.tasks.length > 0 && (
        <span className='Layer__tasks-month-selector__month__completed'>
          <CheckIcon size={12} />
        </span>
      )}
      {!isCompleted && data.tasks.length > 0 && (
        <span className='Layer__tasks-month-selector__month__incompleted'>
          <Text size={TextSize.sm}>{data.tasks.length}</Text>
          <AlertCircle size={12} />
        </span>
      )}
    </div>
  )
}

export { TaskMonthTile }
