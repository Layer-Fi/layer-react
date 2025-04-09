import { Cell, Pie, PieChart } from 'recharts'
import { TASKS_CHARTS_COLORS } from '../../config/charts'
import { useTasksContext } from './TasksContext'
import { format } from 'date-fns'
import { Heading, HeadingSize } from '../Typography/Heading'
import { Text, TextSize } from '../Typography/Text'
import { BookkeepingStatus } from '../BookkeepingStatus/BookkeepingStatus'
import classNames from 'classnames'
import { BookkeepingStatusDescription } from '../BookkeepingStatus/BookkeepingStatusDescription'
import { getCompletedTasks, getIncompleteTasks } from '../../utils/bookkeeping/tasks/bookkeepingTasksFilters'

export const TasksPending = () => {
  const { currentMonthData, currentMonthDate } = useTasksContext()

  const totalTaskCount = currentMonthData?.tasks?.length ?? 0
  const completedTaskCount = getCompletedTasks(currentMonthData?.tasks ?? []).length
  const incompleteTaskCount = getIncompleteTasks(currentMonthData?.tasks ?? []).length

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
        <Heading size={HeadingSize.secondary}>{format(currentMonthDate, 'MMMM yyyy')}</Heading>
        {currentMonthData?.tasks && currentMonthData?.tasks?.length > 0
          ? (
            <div className='Layer__tasks-pending-bar'>
              <Text size={TextSize.sm}>
                <span className={taskStatusClassName}>{completedTaskCount}</span>
                /
                {totalTaskCount}
                {' '}
                done
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
                        className='Layer__profit-and-loss-detailed-charts__pie'
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
        {currentMonthData && (
          <>
            <BookkeepingStatus status={currentMonthData.status} month={currentMonthDate.getMonth()} emphasizeWarning />
            <BookkeepingStatusDescription status={currentMonthData.status} month={currentMonthDate.getMonth()} />
          </>
        )}
      </div>
    </div>
  )
}
