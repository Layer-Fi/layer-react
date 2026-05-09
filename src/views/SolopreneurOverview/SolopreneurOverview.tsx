import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ExpensesSummaryCard } from '@components/ExpensesSummaryCard/ExpensesSummaryCard'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossSummaryCard } from '@components/ProfitAndLossSummaryCard/ProfitAndLossSummaryCard'
import {
  TaxEstimatesSummaryCard,
  TaxEstimatesSummaryCardMode,
} from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { View } from '@components/View/View'

import './solopreneurOverview.scss'

type CardStringOverrides = {
  header?: string
}

interface SolopreneurOverviewStringOverrides {
  title?: string
  profitAndLossSummaries?: ProfitAndLossSummariesStringOverrides
  profitAndLossSummaryCard?: CardStringOverrides
  expensesSummaryCard?: CardStringOverrides
  taxEstimatesSummaryCard?: CardStringOverrides
}

export interface SolopreneurOverviewProps {
  onTransactionsToReviewClick?: () => void
  chartColorsList?: string[]
  stringOverrides?: SolopreneurOverviewStringOverrides
}

export const SolopreneurOverview = ({
  onTransactionsToReviewClick,
  chartColorsList,
  stringOverrides,
}: SolopreneurOverviewProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title={stringOverrides?.title ?? t('solopreneurOverview:label.solopreneur_overview', 'Solopreneur overview')}
        showHeader
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol>
                <GlobalMonthPicker truncateMonth={isMobile} />
              </HeaderCol>
            </HeaderRow>
          </Header>
        )}
      >
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLossSummaries}
          chartColorsList={chartColorsList}
          onTransactionsToReviewClick={onTransactionsToReviewClick}
        />
        <div className='Layer__SolopreneurOverview__Grid'>
          <ProfitAndLossSummaryCard
            stringOverrides={{ title: stringOverrides?.profitAndLossSummaryCard?.header }}
          />
          <ExpensesSummaryCard
            stylingProps={{ chartColorsList }}
            stringOverrides={{ title: stringOverrides?.expensesSummaryCard?.header }}
          />
          <TaxEstimatesSummaryCard
            mode={TaxEstimatesSummaryCardMode.HorizontalBarChart}
            withHeaderSeparator
            title={stringOverrides?.taxEstimatesSummaryCard?.header}
          />
        </div>
      </View>
    </ProfitAndLoss>
  )
}
