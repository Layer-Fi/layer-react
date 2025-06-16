import RefreshCcw from '../../icons/RefreshCcw'
import { IconButton } from '../Button'
import { SmallLoader } from '../Loader'
import classNames from 'classnames'

interface SyncingComponentProps {
  title?: string
  message?: string
  onRefresh?: () => void
  timeSync?: number
  inProgress?: boolean
  hideContent?: boolean
}

/**
 * SyncingComponent
 * @param title - Title of the component
 * @param message - Message of the component
 * @param onRefresh - Function to refresh the component
 * @param timeSync - Time to sync in minutes
 * @param inProgress - Show progress icon besides button
 * @param hideContent - Hide content of the component
 *
 * @example
 * <SyncingComponent
 *  title='Syncing account data'
 *  message='This may take up to'
 *  onRefresh={() => console.log('refresh')}
 *  timeSync={1440}
 *  inProgress={false}
 *  hideContent={false}
 * />
 */
export const SyncingComponent = ({
  title = 'Syncing account data',
  message = 'This may take up to',
  onRefresh,
  inProgress = false,
  timeSync = 1440,
  hideContent = false,
}: SyncingComponentProps) => {
  const handleRefresh = () => {
    if (onRefresh) {
      void onRefresh()
    }
  }

  const timeSyncInfo = () => {
    if (timeSync > 60) {
      return `${Math.floor(timeSync / 60)} hours`
    }
    return `${timeSync} minutes`
  }

  return (
    <div
      className={classNames(
        'Layer__syncing-component',
        inProgress ? 'Layer__syncing-component--with-border' : '',
      )}
    >
      <div className='Layer__syncing-component__actions'>
        {inProgress
          ? (
            <SmallLoader />
          )
          : (
            <IconButton icon={<RefreshCcw />} onClick={handleRefresh} />
          )}
      </div>
      {!hideContent && (
        <div className='Layer__syncing-component__content'>
          <div className='Layer__syncing-component__title'>{title}</div>
          <div className='Layer__syncing-component__message'>{`${message} ${timeSyncInfo()}`}</div>
        </div>
      )}
    </div>
  )
}
