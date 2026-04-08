import { FileText } from 'lucide-react'
import type { ReactNode } from 'react'

import type { TaxOverviewBannerReview } from '@schemas/taxEstimates/overview'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Banner } from '@ui/Banner/Banner'
import { Button } from '@ui/Button/Button'

export type TaxBannerReviewPayload = TaxOverviewBannerReview

type TaxBannerAction = {
  label: ReactNode
  onPress: (payload: TaxBannerReviewPayload) => void
  payload: TaxBannerReviewPayload
  isDisabled?: boolean
  isPending?: boolean
}

export type TaxBannerProps = {
  title: string
  description?: string
  action?: TaxBannerAction
  icon?: ReactNode
}

export const TaxBanner = ({
  title,
  description,
  action,
  icon = <FileText size={16} />,
}: TaxBannerProps) => {
  const { isMobile } = useSizeClass()
  return (
    <Banner
      variant='dark'
      title={title}
      description={description}
      slots={{
        Icon: isMobile ? null : icon,
        Button: action
          ? (
            <Button
              variant='solid'
              onPress={() => action.onPress(action.payload)}
              isDisabled={action.isDisabled}
              isPending={action.isPending}
            >
              {action.label}
            </Button>
          )
          : undefined,
      }}
    />
  )
}
