import { useContext, useMemo } from 'react'
import { TASKS_CHARTS_COLORS } from '../../config/charts'
import { TasksContext } from '../../contexts/TasksContext'
import { isComplete } from '../../types/tasks'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'
import { endOfMonth, format, isAfter, isBefore, parseISO, startOfMonth } from 'date-fns'
import { Cell, Pie, PieChart } from 'recharts'

export const TasksPending = () => {
  const { data: rawData, currentDate } = useContext(TasksContext)

  const data = useMemo(() => {
    return rawData?.filter(x => {
      const d = x.effective_date ? parseISO(x.effective_date) : parseISO(x.created_at)
      return !isBefore(d, startOfMonth(currentDate)) && !isAfter(d, endOfMonth(currentDate))
    })
  }, [rawData, currentDate])

  const completedTasks = data?.filter(task => isComplete(task.status)).length

  const chartData = [
    {
      name: 'done',
      value: completedTasks,
    },
    {
      name: 'pending',
      value: data?.filter(task => !isComplete(task.status)).length,
    },
  ]

  const taskStatusClassName = classNames(
    completedTasks && completedTasks > 0
      ? 'Layer__tasks-pending-bar__status--done'
      : 'Layer__tasks-pending-bar__status--pending',
  )

  return (
    <div className='Layer__tasks-pending'>
      <Text size={TextSize.lg}>{format(currentDate, 'MMMM')}</Text>
      {data && data?.length > 0 ? (
        <div className='Layer__tasks-pending-bar'>
          <Text size={TextSize.sm}>
            <span className={taskStatusClassName}>{completedTasks}</span>/
            {data?.length} done
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
                    className={'Layer__profit-and-loss-detailed-charts__pie'}
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
      ) : null}
    </div>
  )
}
