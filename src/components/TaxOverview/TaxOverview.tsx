import { type TaxOverviewBannerReview, type TaxOverviewData } from '@schemas/taxEstimates/overview'
import { VStack } from '@ui/Stack/Stack'
import { TaxableIncomeCard } from '@components/TaxOverview/TaxableIncomeCard'
import { TaxDeadlinesCard } from '@components/TaxOverview/TaxDeadlinesCard'
import { Loader } from '@components/Loader/Loader'

import './taxOverview.scss'

type TaxOverviewProps = {
  data: TaxOverviewData
  title: string
  description: string
  isTaxDeadlinesLoading?: boolean
  onTaxBannerReviewClick?: (payload: TaxOverviewBannerReview) => void
}

export const TaxOverview = ({
  data,
  description,
  isTaxDeadlinesLoading = false,
  onTaxBannerReviewClick,
  title,
}: TaxOverviewProps) => {
  const annualDeadline = data.annualDeadline
  const paymentDeadlines = data.paymentDeadlines

  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <TaxableIncomeCard
        description={description}
        incomeTotal={data.incomeTotal}
        deductionsTotal={data.deductionsTotal}
        title={title}
        showHeader={false}
      />
      {isTaxDeadlinesLoading && <Loader />}
      {annualDeadline && paymentDeadlines && (
        <TaxDeadlinesCard
          annualDeadline={annualDeadline}
          onTaxBannerReviewClick={onTaxBannerReviewClick}
          paymentDeadlines={paymentDeadlines}
        />
      )}
    </VStack>
  )
}
