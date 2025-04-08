import { Text, TextSize } from '../Typography'
import { TaskStatusBadge } from './TaskStatusBadge'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { MonthData } from './types'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { useLayerContext } from '../../contexts/LayerContext'
import { isBusinessHistoricalMonth } from '../../utils/business'

export type TaskMonthTileProps = {
  data: MonthData
  active?: boolean
  disabled?: boolean
  onClick: (date: Date) => void
}

export const TaskMonthTile = ({ data, onClick, active, disabled }: TaskMonthTileProps) => {
  const dataProperties = toDataProperties({ active, disabled })
  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const { business } = useLayerContext()

  const defaultStatus = isBusinessHistoricalMonth(data.date, business)
    ? 'IN_PROGRESS_AWAITING_BOOKKEEPER'
    : undefined

  return (
    <div
      className='Layer__tasks-month-selector__month'
      onClick={() => !disabled && onClick(new Date(data.year, data.month - 1, 1))}
      {...dataProperties}
    >
      <Text size={TextSize.sm} className='Layer__tasks-month-selector__month__str'>
        {data.monthStr}
      </Text>
      {bookkeepingStatus === 'ACTIVE' && (
        <TaskStatusBadge status={data.status} defaultStatus={defaultStatus} tasksCount={data.total - data.completed} />
      )}
    </div>
  )
}
