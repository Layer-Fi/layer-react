import React from 'react'
import { Badge } from '../../components/Badge'
import { BadgeSize, BadgeVariant } from '../../components/Badge/Badge'
import BellIcon from '../../icons/Bell'
import CheckIcon from '../../icons/Check'
import LoaderIcon from '../../icons/Loader'
import RefreshCcw from '../../icons/RefreshCcw'
import { LoadedStatus } from '../../types/general'
import { BadgeLoader } from '../BadgeLoader'

interface BadgesProps {
  loaded?: LoadedStatus
  error: any
  refetch: () => void
  toReview: number
  inBottomBar?: boolean
}

export const Badges = ({
  loaded,
  error,
  refetch,
  toReview,
  inBottomBar,
}: BadgesProps) => {
  if (loaded === 'initial' || loaded === 'loading') {
    if (inBottomBar) {
      return (
        <Badge
          variant={BadgeVariant.LIGHT}
          size={BadgeSize.SMALL}
          icon={<LoaderIcon size={11} className='Layer__anim--rotating' />}
          wide
        >
          Checking...
        </Badge>
      )
    }

    return <BadgeLoader />
  }

  if (loaded === 'complete' && error) {
    return (
      <Badge
        variant={BadgeVariant.ERROR}
        size={BadgeSize.SMALL}
        icon={<RefreshCcw size={12} />}
        onClick={() => refetch()}
        wide
      >
        Refresh
      </Badge>
    )
  }

  if (loaded === 'complete' && !error && toReview > 0) {
    return (
      <Badge
        variant={BadgeVariant.WARNING}
        size={BadgeSize.SMALL}
        icon={<BellIcon size={12} />}
        wide
      >
        {toReview} pending
      </Badge>
    )
  }

  if (loaded === 'complete' && !error && toReview === 0) {
    return (
      <Badge
        variant={BadgeVariant.SUCCESS}
        size={BadgeSize.SMALL}
        icon={<CheckIcon size={12} />}
        wide
      >
        All done
      </Badge>
    )
  }

  return null
}
