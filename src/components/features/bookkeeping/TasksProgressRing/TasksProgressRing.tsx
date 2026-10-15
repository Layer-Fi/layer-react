import { Cell, Pie, PieChart } from 'recharts'

import { type BusinessTask } from '@schemas/features/bookkeeping/businessTask'
import { getCompletedTasks, getIncompleteTasks } from '@utils/features/bookkeeping/bookkeepingTasksFilters'

import './tasksProgressRing.scss'

const COLORS = {
  done: 'var(--color-info-success)',
  pending: 'var(--color-info-warning)',
}

/** Done against open tasks as a small ring; it animates as a task completes. */
export const TasksProgressRing = ({ tasks }: { tasks: ReadonlyArray<Pick<BusinessTask, 'status'>> }) => {
  const chartData = [
    { name: 'done', value: getCompletedTasks(tasks).length },
    { name: 'pending', value: getIncompleteTasks(tasks).length },
  ] as const

  return (
    <PieChart width={24} height={24} className='Layer__TasksProgressRing'>
      <Pie
        data={chartData}
        dataKey='value'
        nameKey='name'
        cx='50%'
        cy='50%'
        innerRadius={5}
        outerRadius={9}
        paddingAngle={0.2}
        fill={COLORS.pending}
        width={16}
        height={16}
        animationDuration={250}
        animationEasing='ease-in-out'
      >
        {chartData.map(({ name }) => <Cell key={name} className='Layer__DetailedChart__Slice' fill={COLORS[name]} />)}
      </Pie>
    </PieChart>
  )
}
