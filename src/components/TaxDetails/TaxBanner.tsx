import { FileText } from 'lucide-react'
import type { ReactNode } from 'react'
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
  uncategorizedReviewPayload?: TaxBannerReviewPayload
  onPressReviewButton?: TaxBannerReviewHandler
  icon?: ReactNode
}

export const TaxBanner = ({
  uncategorizedReviewPayload,
  onPressReviewButton,
  icon = <FileText size={16} />,
}: TaxBannerProps) => {
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()

  const title = uncategorizedReviewPayload
    ? t('taxEstimates:banner.categorization_incomplete.title', 'Your tax estimates are incomplete')
    : t('taxEstimates:label.tax_estimates', 'Tax estimates')

  const description = uncategorizedReviewPayload
    ? tPlural(
      t,
      'taxEstimates:banner.categorization_incomplete.description',
      {
        count: uncategorizedReviewPayload.count,
        amount: convertCentsToDecimalString(uncategorizedReviewPayload.amount),
        one: 'You have {{count}} uncategorized transaction with ${{amount}} in potential deductions to review.',
        other: 'You have {{count}} uncategorized transactions with ${{amount}} in potential deductions to review.',
      },
    )
    : t('taxEstimates:label.tax_estimates_description', 'Tax estimates are a way to estimate your taxes based on your income and expenses.')

  return (
    <HStack className='Layer__TaxBanner'>
      <Banner
        variant='dark'
        title={title}
        description={description}
        slots={{
          Icon: isMobile ? null : icon,
          Button: onPressReviewButton
            ? (
              <Button
                variant='solid'
                onPress={() => onPressReviewButton(uncategorizedReviewPayload)}
              >
                {t('taxEstimates:action.review_banner', 'Review')}
              </Button>
            )
            : undefined,
        }}
      />
    </HStack>
  )
}
