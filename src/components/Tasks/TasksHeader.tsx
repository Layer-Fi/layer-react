import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

export const TasksHeader = ({
  tasksHeader = 'Bookkeeping Tasks',
  collapsable,
}: {
  tasksHeader?: string
  collapsable?: boolean
  open?: boolean
  toggleContent: () => void
}) => {
  return (
    <div className={classNames('Layer__tasks-header', collapsable && 'Layer__tasks-header--collapsable')}>
      <div className='Layer__tasks-header__left-col'>
        <div className='Layer__tasks-header__left-col__title'>
          <Text size={TextSize.lg}>{tasksHeader}</Text>
        </div>
      </div>
    </div>
  )
}
