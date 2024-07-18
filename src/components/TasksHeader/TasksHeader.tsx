import React, { useContext } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import AlertCircle from '../../icons/AlertCircle'
import Check from '../../icons/Check'
import RefreshCcw from '../../icons/RefreshCcw'
import { isComplete } from '../../types/tasks'
import { Badge, BadgeVariant } from '../Badge'
import { Text, TextSize } from '../Typography'

const ICONS = {
  done: {
    icon: <Check size={12} />,
    text: 'Done',
    badge: BadgeVariant.SUCCESS,
  },
  pending: {
    icon: <AlertCircle size={12} />,
    text: 'In progress',
    badge: BadgeVariant.WARNING,
  },
  refresh: {
    icon: <RefreshCcw size={12} />,
    text: 'Refresh',
    badge: BadgeVariant.DEFAULT,
  },
}

export const TasksHeader = ({
  tasksHeader = 'Book Tasks',
}: {
  tasksHeader?: string
}) => {
  const { data: tasks, refetch, error } = useContext(TasksContext)

  const completedTasks = tasks?.filter(task => isComplete(task.status)).length

  const badgeVariant =
    completedTasks === tasks?.length ? ICONS.done : ICONS.pending

  return (
    <div className='Layer__tasks-header'>
      <Text size={TextSize.lg}>{tasksHeader}</Text>
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
