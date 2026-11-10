import { BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { HStack } from '@ui/Stack/Stack'
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
  const dataProperties = toDataProperties({ active, disabled, status: disabled ? undefined : data.status })
  const openTasksCount = data.total - data.completed
  const isClosed = data.status === BookkeepingPeriodStatus.CLOSED_COMPLETE || data.status === BookkeepingPeriodStatus.CLOSED_OPEN_TASKS

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
        <HStack align='center' gap='xs'>
          {openTasksCount > 0 && (
            <TaskStatusBadge status={BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER} tasksCount={openTasksCount} isMobile={isMobile} />
          )}
          <TaskStatusBadge status={isClosed ? BookkeepingPeriodStatus.CLOSED_COMPLETE : data.status} isMobile={isMobile} />
        </HStack>
      )}
    </div>
  )
}
