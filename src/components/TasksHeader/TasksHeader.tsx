import React, { useContext } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import Check from '../../icons/Check'
import ProgressIcon from '../../icons/ProgressIcon'
import RefreshCcw from '../../icons/RefreshCcw'
import { Badge, BadgeVariant } from '../Badge'
import { Text, TextSize } from '../Typography'

const ICONS = {
  done: {
    icon: <Check size={12} />,
    text: 'Done',
    badge: BadgeVariant.SUCCESS,
  },
  pending: {
    icon: <ProgressIcon size={12} />,
    text: 'In progress',
    badge: BadgeVariant.WARNING,
  },
  refresh: {
    icon: <RefreshCcw size={12} />,
    text: 'Refresh',
    badge: BadgeVariant.DEFAULT,
  },
}

export const TasksHeader = () => {
  const { data: tasks, refetch, error } = useContext(TasksContext)

  const completedTasks = tasks?.filter(task => task.status === 'COMPLETED')
    .length

  const badgeVariant =
    completedTasks === tasks?.length ? ICONS.done : ICONS.pending

  return (
    <div className='Layer__tasks-header'>
      <Text size={TextSize.lg}>December Books</Text>
      {!tasks || error ? (
        <Badge
          onClick={() => refetch()}
          variant={ICONS.refresh.badge}
          icon={ICONS.refresh.icon}
        >
          {ICONS.refresh.text}
        </Badge>
      ) : (
        <Badge variant={badgeVariant.badge} icon={badgeVariant.icon}>
          {badgeVariant.text}
        </Badge>
      )}
    </div>
  )
}
