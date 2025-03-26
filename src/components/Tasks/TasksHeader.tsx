import AlertCircle from '../../icons/AlertCircle'
import Check from '../../icons/Check'
import ProgressIcon from '../../icons/ProgressIcon'
import RefreshCcw from '../../icons/RefreshCcw'
import { Badge, BadgeVariant } from '../Badge'
import { Text, TextSize } from '../Typography'
import { useLayerContext } from '../../contexts/LayerContext'
import { getEarliestDateToBrowse } from '../../utils/business'
import classNames from 'classnames'

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
  tasksHeader = 'Bookkeeping Tasks',
  collapsable,
  open,
  toggleContent,
  highlightYears,
}: {
  tasksHeader?: string
  collapsable?: boolean
  open?: boolean
  toggleContent: () => void
  highlightYears?: number[]
}) => {
  const { business } = useLayerContext()

  // const completedTasks = tasks?.filter(task => isComplete(task.status)).length
  const completedTasks = 0
  const loadedStatus = 'complete'
  const refetch = () => {}
  const tasks = undefined
  const error = undefined

  const badgeVariant = ICONS.done
  // completedTasks === tasks?.length ? ICONS.done : ICONS.pending

  const minDate = getEarliestDateToBrowse(business)

  return (
    <div className={classNames('Layer__tasks-header', collapsable && 'Layer__tasks-header--collapsable')}>
      <div className='Layer__tasks-header__left-col'>
        <div className='Layer__tasks-header__left-col__title'>
          <Text size={TextSize.lg}>{tasksHeader}</Text>
          {loadedStatus !== 'complete' && !open
            ? (
              <Badge variant={ICONS.loading.badge} icon={ICONS.loading.icon}>
                {ICONS.loading.text}
              </Badge>
            )
            : loadedStatus === 'complete' && !open && (!tasks || error)
              ? (
                <Badge
                  onClick={() => {
                    void refetch()
                  }}
                  variant={ICONS.refresh.badge}
                  icon={ICONS.refresh.icon}
                >
                  {ICONS.refresh.text}
                </Badge>
              )
              : loadedStatus === 'complete' && !open
                ? (
                  <Badge variant={badgeVariant.badge} icon={badgeVariant.icon}>
                    {badgeVariant.text}
                  </Badge>
                )
                : open
                  ? null
                  : (
                    <Badge variant={badgeVariant.badge} icon={badgeVariant.icon}>
                      {badgeVariant.text}
                    </Badge>
                  )}
        </div>
      </div>
    </div>
  )
}
