import classNames from 'classnames'
import { Trans } from 'react-i18next'

import { getCompletedTasks, getIncompleteTasks } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useGlobalDate } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useActiveBookkeepingPeriod } from '@hooks/features/bookkeeping/useActiveBookkeepingPeriod'
import { DataState } from '@ui/DataState/DataState'
import { Heading } from '@ui/Typography/Heading'
import { P } from '@ui/Typography/Text'
import { useBookkeepingStatusConfig } from '@features/bookkeeping/BookkeepingStatus/useBookkeepingStatusConfig'
import { TasksProgressRing } from '@features/bookkeeping/TasksProgressRing/TasksProgressRing'

import './tasksPending.scss'

export const TasksPending = () => {
  const { date } = useGlobalDate()
  const { formatDate, formatNumber } = useIntlFormatter()
  const { activePeriod } = useActiveBookkeepingPeriod()

  const totalTaskCount = activePeriod?.tasks?.length ?? 0
  const completedTaskCount = getCompletedTasks(activePeriod?.tasks ?? []).length
  const incompleteTaskCount = getIncompleteTasks(activePeriod?.tasks ?? []).length
  const displayCompletedTaskCount = formatNumber(completedTaskCount)
  const displayTotalTaskCount = formatNumber(totalTaskCount)
  const statusConfig = useBookkeepingStatusConfig({
    status: activePeriod?.status,
    monthNumber: activePeriod?.month,
    incompleteTasksCount: incompleteTaskCount,
  })

  const taskStatusClassName = classNames(
    completedTaskCount > 0
      ? 'Layer__tasks-pending-bar__status--done'
      : 'Layer__tasks-pending-bar__status--pending',
  )

  return (
    <div className='Layer__tasks-pending'>
      <div className='Layer__tasks-pending-header'>
        <Heading level={3} size='sm'>
          {formatDate(date, DateFormat.MonthYear)}
        </Heading>
        {activePeriod?.tasks && activePeriod.tasks.length > 0
          ? (
            <div className='Layer__tasks-pending-bar'>
              <P size='sm'>
                <Trans
                  i18nKey='bookkeeping:Tasks.TasksPending.label.completed_over_total_done'
                  count={totalTaskCount}
                  values={{ displayCompletedTaskCount, displayTotalTaskCount }}
                  defaults='<completed>{{displayCompletedTaskCount}}</completed>/{{displayTotalTaskCount}} done'
                  components={{
                    completed: <span className={taskStatusClassName} />,
                  }}
                />
              </P>
              <TasksProgressRing tasks={activePeriod.tasks} />
            </div>
          )
          : null}
      </div>
      <div className='Layer__tasks-pending-main'>
        {statusConfig && (
          <DataState
            inline
            status={statusConfig.status}
            icon={statusConfig.icon}
            title={statusConfig.label}
            description={statusConfig.description}
            slotProps={{ Title: { status: statusConfig.status } }}
          />
        )}
      </div>
    </div>
  )
}
