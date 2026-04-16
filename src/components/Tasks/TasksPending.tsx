import classNames from 'classnames'
import { Trans } from 'react-i18next'
import { Cell, Pie, PieChart } from 'recharts'

import { getCompletedTasks, getIncompleteTasks } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useActiveBookkeepingPeriod } from '@hooks/features/bookkeeping/useActiveBookkeepingPeriod'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { BookkeepingStatus } from '@components/BookkeepingStatus/BookkeepingStatus'
import { BookkeepingStatusDescription } from '@components/BookkeepingStatus/BookkeepingStatusDescription'
import { Heading, HeadingSize } from '@components/Typography/Heading'
import { Text, TextSize } from '@components/Typography/Text'

const TASKS_CHARTS_COLORS = {
  done: '#3B9C63',
  pending: '#DFA000',
}

export const TasksPending = () => {
  const { date } = useGlobalDate()
  const { formatDate, formatNumber } = useIntlFormatter()
  const { activePeriod } = useActiveBookkeepingPeriod()

  const totalTaskCount = activePeriod?.tasks?.length ?? 0
  const completedTaskCount = getCompletedTasks(activePeriod?.tasks ?? []).length
  const incompleteTaskCount = getIncompleteTasks(activePeriod?.tasks ?? []).length
  const displayCompletedTaskCount = formatNumber(completedTaskCount)
  const displayTotalTaskCount = formatNumber(totalTaskCount)

  const chartData = [
    {
      name: 'done',
      value: completedTaskCount,
    },
    {
      name: 'pending',
      value: incompleteTaskCount,
    },
  ]

  const taskStatusClassName = classNames(
    completedTaskCount > 0
      ? 'Layer__tasks-pending-bar__status--done'
      : 'Layer__tasks-pending-bar__status--pending',
  )

  return (
    <div className='Layer__tasks-pending'>
      <div className='Layer__tasks-pending-header'>
        <Heading size={HeadingSize.secondary}>{formatDate(date, DateFormat.MonthYear)}</Heading>
        {activePeriod?.tasks && activePeriod.tasks.length > 0
          ? (
            <div className='Layer__tasks-pending-bar'>
              <Text size={TextSize.sm}>
                <Trans
                  i18nKey='bookkeeping:label.completed_over_total_done'
                  count={totalTaskCount}
                  values={{ displayCompletedTaskCount, displayTotalTaskCount }}
                  defaults='<completed>{{displayCompletedTaskCount}}</completed>/{{displayTotalTaskCount}} done'
                  components={{
                    completed: <span className={taskStatusClassName} />,
                  }}
                />
              </Text>
              <PieChart width={24} height={24} className='mini-chart'>
                <Pie
                  data={chartData}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius={5}
                  outerRadius={9}
                  paddingAngle={0.2}
                  fill={TASKS_CHARTS_COLORS.pending}
                  width={16}
                  height={16}
                  animationDuration={250}
                  animationEasing='ease-in-out'
                >
                  {chartData.map((task, index) => {
                    return (
                      <Cell
                        key={`cell-${index}`}
                        className='Layer__DetailedChart__slice'
                        fill={
                          TASKS_CHARTS_COLORS[
                            task.name as keyof typeof TASKS_CHARTS_COLORS
                          ]
                        }
                      />
                    )
                  })}
                </Pie>
              </PieChart>
            </div>
          )
          : null}
      </div>
      <div className='Layer__tasks-pending-main'>
        {activePeriod && (
          <>
            <BookkeepingStatus status={activePeriod.status} monthNumber={activePeriod.month} />
            <BookkeepingStatusDescription
              status={activePeriod.status}
              monthNumber={activePeriod.month}
              incompleteTasksCount={incompleteTaskCount}
            />
          </>
        )}
      </div>
    </div>
  )
}
