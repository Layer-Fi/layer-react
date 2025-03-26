import { BookkeepingPeriodStatus, useBookkeepingPeriods } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { useTasksContext } from './TasksContext'

export const TasksPending = ({ bookkeepingMonthStatus }: { bookkeepingMonthStatus?: BookkeepingPeriodStatus }) => {
  const { data: rawData, currentDate } = useTasksContext()

  // const data = useMemo(() => {
  //   return rawData?.filter((x) => {
  //     const d = x.effective_date ? parseISO(x.effective_date) : parseISO(x.created_at)
  //     return !isBefore(d, startOfMonth(currentDate)) && !isAfter(d, endOfMonth(currentDate))
  //   })
  // }, [rawData, currentDate])

  // const completedTasks = data?.filter(task => isComplete(task.status)).length

  // const chartData = [
  //   {
  //     name: 'done',
  //     value: completedTasks,
  //   },
  //   {
  //     name: 'pending',
  //     value: data?.filter(task => !isComplete(task.status)).length,
  //   },
  // ]

  // const taskStatusClassName = classNames(
  //   completedTasks && completedTasks > 0
  //     ? 'Layer__tasks-pending-bar__status--done'
  //     : 'Layer__tasks-pending-bar__status--pending',
  // )

  const { mutate } = useBookkeepingPeriods()
  return (
    <p>
      Tasks pending
      <button onClick={() => void mutate()}>Refetch</button>
    </p>
  )

  // return (
  //   <div className='Layer__tasks-pending'>
  //     <div className='Layer__tasks-pending-header'>
  //       <Heading size={HeadingSize.secondary}>{format(currentDate, 'MMMM yyyy')}</Heading>
  //       {data && data?.length > 0
  //         ? (
  //           <div className='Layer__tasks-pending-bar'>
  //             <Text size={TextSize.sm}>
  //               <span className={taskStatusClassName}>{completedTasks}</span>
  //               /
  //               {data?.length}
  //               {' '}
  //               done
  //             </Text>
  //             <PieChart width={24} height={24} className='mini-chart'>
  //               <Pie
  //                 data={chartData}
  //                 dataKey='value'
  //                 nameKey='name'
  //                 cx='50%'
  //                 cy='50%'
  //                 innerRadius={5}
  //                 outerRadius={9}
  //                 paddingAngle={0.2}
  //                 fill={TASKS_CHARTS_COLORS.pending}
  //                 width={16}
  //                 height={16}
  //                 animationDuration={250}
  //                 animationEasing='ease-in-out'
  //               >
  //                 {chartData.map((task, index) => {
  //                   return (
  //                     <Cell
  //                       key={`cell-${index}`}
  //                       className='Layer__profit-and-loss-detailed-charts__pie'
  //                       fill={
  //                         TASKS_CHARTS_COLORS[
  //                           task.name as keyof typeof TASKS_CHARTS_COLORS
  //                         ]
  //                       }
  //                     />
  //                   )
  //                 })}
  //               </Pie>
  //             </PieChart>
  //           </div>
  //         )
  //         : null}
  //     </div>
  //     <div className='Layer__tasks-pending-main'>
  //       {bookkeepingMonthStatus && (
  //         <BookkeepingStatus status={bookkeepingMonthStatus} month={currentDate.getMonth()} emphasizeWarning />
  //       )}
  //       <BookkeepingStatusDescription status={bookkeepingMonthStatus} month={currentDate.getMonth()} />
  //     </div>
  //   </div>

  // )
}
