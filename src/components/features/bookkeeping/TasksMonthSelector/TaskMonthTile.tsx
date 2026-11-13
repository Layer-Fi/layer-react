import { useRef } from 'react'

import { BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useHorizontalOverflow } from '@hooks/utils/size/useHorizontalOverflow'
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
  const badgesRef = useRef<HTMLDivElement>(null)
  const { status } = data
  const dataProperties = toDataProperties({ active, disabled, status: disabled ? undefined : status })
  const openTasksCount = data.total - data.completed
  const isClosed = status === BookkeepingPeriodStatus.CLOSED_COMPLETE || status === BookkeepingPeriodStatus.CLOSED_OPEN_TASKS
  const isCompact = useHorizontalOverflow(badgesRef, { dependencies: [openTasksCount, status, isMobile] })

  return (
    <div
      className='Layer__tasks-month-selector__month'
      onClick={() => !disabled && onClick(new Date(data.year, data.month - 1, 1))}
      {...dataProperties}
    >
      <P size='sm' status={disabled ? 'disabled' : undefined}>
        {data.monthStr}
      </P>
      {status && (
        <HStack ref={badgesRef} className='Layer__TaskMonthTile__Badges' align='center' overflow='clip' fluid>
          {[false, true].map(compact => (
            <HStack
              key={compact ? 'compact' : 'expanded'}
              className='Layer__TaskMonthTile__BadgeVariant'
              {...toDataProperties({ compact, hidden: compact !== isCompact })}
              align='center'
              gap='xs'
            >
              {openTasksCount > 0 && (
                <TaskStatusBadge status={BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER} tasksCount={openTasksCount} isMobile={isMobile || compact} />
              )}
              <TaskStatusBadge status={isClosed ? BookkeepingPeriodStatus.CLOSED_COMPLETE : status} isMobile={isMobile} />
            </HStack>
          ))}
        </HStack>
      )}
    </div>
  )
}
