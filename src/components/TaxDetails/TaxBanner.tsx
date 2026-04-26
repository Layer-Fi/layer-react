import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { convertCentsToDecimalString } from '@utils/format'
import { tPlural } from '@utils/i18n/plural'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesContext } from '@contexts/TaxEstimatesContext/TaxEstimatesContextProvider'
import { Banner } from '@ui/Banner/Banner'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'

import './taxBanner.scss'

export type TaxBannerProps = {
  uncategorizedCount: number
  uncategorizedAmount: number
}

export const TaxBanner = ({ uncategorizedCount, uncategorizedAmount }: TaxBannerProps) => {
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()
  const { onClickReviewTransactions } = useTaxEstimatesContext()

  const ReviewButton = onClickReviewTransactions
    ? (
      <Button
        variant='solid'
        onPress={() => onClickReviewTransactions({
          uncategorizedAmount,
          uncategorizedTransactionCount: uncategorizedCount,
        })}
      >
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
          count: uncategorizedCount,
          amount: convertCentsToDecimalString(uncategorizedAmount),
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
