import { useContext } from 'react'
import { TasksContext } from '../../contexts/TasksContext'
import AlertCircle from '../../icons/AlertCircle'
import Check from '../../icons/Check'
import ProgressIcon from '../../icons/ProgressIcon'
import RefreshCcw from '../../icons/RefreshCcw'
import { isComplete } from '../../types/tasks'
import { Badge, BadgeVariant } from '../Badge'
import { ExpandButton } from '../Button'
import { Text, TextSize } from '../Typography'
import { DatePicker } from '../DatePicker'
import { endOfYear, getYear, startOfYear } from 'date-fns'
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
}: {
  tasksHeader?: string
  collapsable?: boolean
  open?: boolean
  toggleContent: () => void
}) => {
  const {
    data: tasks,
    loadedStatus,
    refetch,
    error,
    dateRange,
    setDateRange,
  } = useContext(TasksContext)
  const { business } = useLayerContext()

  const completedTasks = tasks?.filter(task => isComplete(task.status)).length

  const badgeVariant =
    completedTasks === tasks?.length ? ICONS.done : ICONS.pending

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
                  onClick={() => refetch()}
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
        <div className='Layer__tasks-header__left-col__controls'>
          <DatePicker
            selected={dateRange.startDate}
            onChange={(dates) => {
              if (!Array.isArray(dates)) {
                setDateRange({
                  startDate: startOfYear(dates),
                  endDate: endOfYear(dates),
                })
              }
            }}
            dateFormat='YYYY'
            displayMode='yearPicker'
            minDate={minDate}
            maxDate={endOfYear(new Date())}
            currentDateOption={false}
            navigateArrows={['mobile', 'desktop']}
            disabled={minDate && getYear(minDate) === getYear(new Date())}
          />
          {collapsable && (
            <div className='Layer__tasks-header__left-col__expand'>
              <ExpandButton onClick={toggleContent} collapsed={!open} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
