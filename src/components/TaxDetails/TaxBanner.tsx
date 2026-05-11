import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type TaxEstimatesBanner } from '@schemas/taxEstimates/banner'
import { useTaxBanner } from '@hooks/features/taxEstimates/useTaxBanner'
import { useSizeClass } from '@providers/WindowSizeStore/WindowSizeStoreProvider'
import { useTaxEstimatesContext } from '@contexts/TaxEstimatesContext/TaxEstimatesContextProvider'
import { Banner, BannerButton } from '@ui/Banner/Banner'
import { VStack } from '@ui/Stack/Stack'

import './taxBanner.scss'

export type TaxBannerProps = {
  data: TaxEstimatesBanner
}

export const TaxBanner = ({ data }: TaxBannerProps) => {
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()
  const { onClickReviewTransactions } = useTaxEstimatesContext()
  const { bannerDescription } = useTaxBanner(data)

  const title = t('taxEstimates:banner.categorization_incomplete.title', 'Your tax estimates are incomplete')

  const ReviewButton = onClickReviewTransactions
    ? (
      <BannerButton
        onPress={() => onClickReviewTransactions({
          uncategorizedMoneyIn: data.totalUncategorizedMoneyIn,
          uncategorizedMoneyOut: data.totalUncategorizedMoneyOut,
          uncategorizedTransactionCount: data.totalUncategorizedCount,
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
        description={bannerDescription}
        slots={{
          Icon: isMobile ? null : <FileText size={16} />,
          Button: ReviewButton,
        }}
      />
    </VStack>
  )
}
