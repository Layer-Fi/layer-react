import { LoadedStatus } from '../types/general'
import { useEffect, useState } from 'react'

type UseSWRLoadingStatusProps = {
  isLoading?: boolean
  alreadyFetched?: boolean
}

/**
 * The useSWR doesn't set isLoading to true at the very beginning, when component/hook are mounted.
 * In such scenario, loaders won't be shown until the useSWR runs request,
 * therefore loaders will pop-up after a short delay.
 * This hook marks isLoading as true also the state before the request is started.
 */
export const useSWRLoadingStatus = ({ isLoading, alreadyFetched }: UseSWRLoadingStatusProps) => {
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')

  useEffect(() => {
    if (alreadyFetched && loadingStatus === 'initial') {
      setLoadingStatus('complete')
      return
    }

    if (isLoading && loadingStatus === 'initial') {
      setLoadingStatus('loading')
      return
    }

    if (!isLoading && loadingStatus === 'loading') {
      setLoadingStatus('complete')
      return
    }

    if (isLoading && loadingStatus === 'complete') {
      setLoadingStatus('loading')
      return
    }
  }, [isLoading, loadingStatus, alreadyFetched])

  return {
    loadingStatus,
    isLoading: loadingStatus !== 'complete',
  }
}
