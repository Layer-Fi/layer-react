import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { convertCentsToDecimalString } from '@utils/format'
import { tPlural } from '@utils/i18n/plural'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Banner } from '@ui/Banner/Banner'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'

import './taxBanner.scss'

export type TaxBannerReviewPayload = {
  type: 'UNCATEGORIZED_TRANSACTIONS'
  count: number
  amount: number
}
export type TaxBannerReviewHandler = (payload?: TaxBannerReviewPayload) => void

export type TaxBannerProps = {
  uncategorizedReviewPayload: TaxBannerReviewPayload
  onPressReviewButton?: TaxBannerReviewHandler
}

export const TaxBanner = ({
  uncategorizedReviewPayload,
  onPressReviewButton,
}: TaxBannerProps) => {
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()

  const ReviewButton = onPressReviewButton
    ? (
      <Button variant='solid' onPress={() => onPressReviewButton(uncategorizedReviewPayload)}>
        {t('taxEstimates:action.review_banner', 'Review')}
      </Button>
    )
    : undefined

  return (
    <HStack className='Layer__TaxBanner'>
      <Banner
        variant='dark'
        title={t('taxEstimates:banner.categorization_incomplete.title', 'Your tax estimates are incomplete')}
        description={tPlural(t, 'taxEstimates:banner.categorization_incomplete.description', {
          count: uncategorizedReviewPayload.count,
          amount: convertCentsToDecimalString(uncategorizedReviewPayload.amount),
          one: 'You have {{count}} uncategorized transaction with ${{amount}} in potential deductions to review.',
          other: 'You have {{count}} uncategorized transactions with ${{amount}} in potential deductions to review.',
        })}
        slots={{
          Icon: isMobile ? null : <FileText size={16} />,
          Button: ReviewButton,
        }}
      />
    </HStack>
  )
}
