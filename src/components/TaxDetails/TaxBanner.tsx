import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesContext } from '@contexts/TaxEstimatesContext/TaxEstimatesContextProvider'
import { Banner, BannerButton } from '@ui/Banner/Banner'
import { VStack } from '@ui/Stack/Stack'

import './taxBanner.scss'

export type TaxBannerProps = {
  uncategorizedCount: number
  uncategorizedAmount: number
}

export const TaxBanner = ({ uncategorizedCount, uncategorizedAmount }: TaxBannerProps) => {
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { onClickReviewTransactions } = useTaxEstimatesContext()

  const title = t('taxEstimates:banner.categorization_incomplete.title', 'Your tax estimates are incomplete')

  const ReviewButton = onClickReviewTransactions
    ? (
      <BannerButton
        onPress={() => onClickReviewTransactions({
          uncategorizedAmount,
          uncategorizedTransactionCount: uncategorizedCount,
        })}
      >
        {t('taxEstimates:action.review_banner', 'Review')}
      </BannerButton>
    )
    : undefined

  return (
    <VStack className='Layer__TaxBanner' gap='md'>
      <Banner
        variant='warning'
        ariaLabel={title}
        title={title}
        description={tPlural(t, 'taxEstimates:banner.categorization_incomplete.description', {
          count: uncategorizedCount,
          amount: formatCurrencyFromCents(uncategorizedAmount),
          one: 'You have {{count}} uncategorized transaction with {{amount}} in potential deductions to review.',
          other: 'You have {{count}} uncategorized transactions with {{amount}} in potential deductions to review.',
        })}
        slots={{
          Icon: isMobile ? null : <FileText size={16} />,
          Button: ReviewButton,
        }}
      />
    </VStack>
  )
}
