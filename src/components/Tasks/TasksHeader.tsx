import { Text, TextSize } from '../Typography'

export const TasksHeader = ({
  tasksHeader = 'Bookkeeping Tasks',
}: {
  tasksHeader?: string
}) => {
  return (
    <div className='Layer__tasks-header'>
      <Text size={TextSize.lg}>{tasksHeader}</Text>
    </div>
  )
}
