import React from 'react'
import RefreshCcw from '../../icons/RefreshCcw'
import { IconButton } from '../Button'

interface SyncingComponentProps {
  title?: string
  message?: string
  onRefresh?: () => void
  timeSync?: number
}

/**
 * SyncingComponent
 * @param title - Title of the component
 * @param message - Message of the component
 * @param onRefresh - Function to refresh the component
 * @param timeSync - Time to sync in minutes
 *
 * @example
 * <SyncingComponent
 *  title='Syncing account data'
 *  message='This may take up to'
 *  onRefresh={() => console.log('refresh')}
 *  timeSync={1440}
 * />
 */
export const SyncingComponent = ({
  title = 'Syncing account data',
  message = 'This may take up to',
  onRefresh,
  timeSync = 1440,
}: SyncingComponentProps) => {
  const handleRefresh = () => {
    onRefresh && onRefresh()
  }

  const timeSyncInfo = () => {
    if (timeSync > 60) {
      return `${Math.floor(timeSync / 60)} hours`
    }
    return `${timeSync} minutes`
  }

  return (
    <div className='Layer__syncing-component'>
      <div className='Layer__syncing-component__actions'>
        <IconButton icon={<RefreshCcw />} onClick={handleRefresh} />
      </div>
      <div className='Layer__syncing-component__content'>
        <div className='Layer__syncing-component__title'>{title}</div>
        <div className='Layer__syncing-component__message'>{`${message} ${timeSyncInfo()}`}</div>
      </div>
    </div>
  )
}
