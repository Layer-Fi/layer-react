import React, { useContext } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import AlertCircle from '../../icons/AlertCircle'
import Check from '../../icons/Check'
import ProgressIcon from '../../icons/ProgressIcon'
import RefreshCcw from '../../icons/RefreshCcw'
import { isComplete } from '../../types/tasks'
import { Badge, BadgeVariant } from '../Badge'
import { ExpandButton } from '../Button'
import { Text, TextSize } from '../Typography'

const ICONS = {
  loading: {
    icon: <ProgressIcon size={12} className='Layer__anim--rotating' />,
    text: 'Loading',
    badge: BadgeVariant.DEFAULT,
  },
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
  collapsable,
  open,
  toggleContent,
}: {
  tasksHeader?: string
  collapsable?: boolean
  open?: boolean
  toggleContent: () => void
}) => {
  const { data: tasks, loadedStatus, refetch, error } = useContext(TasksContext)

  const completedTasks = tasks?.filter(task => isComplete(task.status)).length

  const badgeVariant =
    completedTasks === tasks?.length ? ICONS.done : ICONS.pending

  return (
    <div className='Layer__tasks-header'>
      <div className='Layer__tasks-header__left-col'>
        <Text size={TextSize.lg}>{tasksHeader}</Text>
        {loadedStatus !== 'complete' && !open ? (
          <Badge variant={ICONS.loading.badge} icon={ICONS.loading.icon}>
            {ICONS.loading.text}
          </Badge>
        ) : loadedStatus === 'complete' && (!tasks || error) ? (
          <Badge
            onClick={() => refetch()}
            variant={ICONS.refresh.badge}
            icon={ICONS.refresh.icon}
          >
            {ICONS.refresh.text}
          </Badge>
        ) : loadedStatus === 'complete' ? (
          <Badge variant={badgeVariant.badge} icon={badgeVariant.icon}>
            {badgeVariant.text}
          </Badge>
        ) : open ? null : (
          <Badge variant={badgeVariant.badge} icon={badgeVariant.icon}>
            {badgeVariant.text}
          </Badge>
        )}
      </div>
      {collapsable && (
        <ExpandButton onClick={toggleContent} collapsed={!open} />
      )}
    </div>
  )
}
