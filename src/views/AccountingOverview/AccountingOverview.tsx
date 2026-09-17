import { type ReactNode, useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { type TagOption } from '@internal-types/features/tags/tag'
import { type OnboardingStep } from '@internal-types/shared/layerContext'
import { getBankAccountNeedingReconnection } from '@utils/features/bankAccounts/bankAccount'
import { usePeriodicNow } from '@hooks/utils/dates/usePeriodicNow'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { GlobalMonthPicker } from '@blocks/DatePickers/GlobalMonthPicker/GlobalMonthPicker'
import { Container } from '@blocks/Layout/Container/Container'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'
import { View } from '@blocks/Layout/View/View'
import { ProfitAndLoss } from '@features/profitAndLoss/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossHeader } from '@features/profitAndLoss/ProfitAndLossHeader/ProfitAndLossHeader'
import { ProfitAndLossLegend } from '@features/profitAndLoss/ProfitAndLossLegend/ProfitAndLossLegend'
import { ProfitAndLossOverviewDetailedCharts } from '@features/profitAndLoss/ProfitAndLossOverviewDetailedCharts/ProfitAndLossOverviewDetailedCharts'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesSlotProps,
  type ProfitAndLossSummariesStringOverrides,
} from '@features/profitAndLoss/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { AccountReconnectionBanner } from '@views/AccountingOverview/AccountReconnectionBanner/AccountReconnectionBanner'

import './accountingOverview.scss'

interface AccountingOverviewStringOverrides {
  title?: string
  header?: string
  profitAndLoss?: {
    detailedCharts?: ProfitAndLossDetailedChartsStringOverrides
    summaries?: ProfitAndLossSummariesStringOverrides
  }
}

export interface AccountingOverviewProps {
  /** @deprecated Use `stringOverrides.title` instead */
  title?: string
  showTitle?: boolean
  /** @deprecated The Onboarding component has been removed; this prop no longer does anything. */
  enableOnboarding?: boolean
  /** @deprecated The Onboarding component has been removed; this prop no longer does anything. */
  onboardingStepOverride?: OnboardingStep
  onTransactionsToReviewClick?: () => void
  onAccountUpdateClick?: () => void
  middleBanner?: ReactNode
  chartColorsList?: string[]
  stringOverrides?: AccountingOverviewStringOverrides
  tagFilter?: TagOption
  slotProps?: {
    profitAndLoss?: {
      summaries?: ProfitAndLossSummariesSlotProps
      chart?: { chartConfig?: ProfitAndLossChartConfig }
      detailedCharts?: {
        revenue?: { chartConfig?: ProfitAndLossChartConfig }
        expenses?: { chartConfig?: ProfitAndLossChartConfig }
      }
    }
  }
}

export const AccountingOverview = (props: AccountingOverviewProps) => (
  <LinkedAccountsProvider>
    <AccountingOverviewContent {...props} />
  </LinkedAccountsProvider>
)

const AccountingOverviewContent = ({
  title,
  showTitle = true,
  onTransactionsToReviewClick,
  onAccountUpdateClick,
  middleBanner,
  chartColorsList,
  stringOverrides,
  tagFilter = undefined,
  slotProps,
}: AccountingOverviewProps) => {
  const { t } = useTranslation()
  const { value: sizeClass } = useSizeClass()
  const { data: bankAccounts } = useBankAccountsContext()
  const { addConnection, repairConnection } = useContext(LinkedAccountsContext)
  const now = usePeriodicNow()
  const accountNeedingReconnection = getBankAccountNeedingReconnection(bankAccounts, now)

  const handleAccountUpdateClick = useCallback(() => {
    if (onAccountUpdateClick) {
      onAccountUpdateClick()
      return
    }

    if (!accountNeedingReconnection) return

    if (accountNeedingReconnection.reconnectWithNewCredentials) {
      void addConnection(accountNeedingReconnection.source)
    }
    else if (accountNeedingReconnection.connectionExternalId) {
      void repairConnection(accountNeedingReconnection.source, accountNeedingReconnection.connectionExternalId)
    }
  }, [onAccountUpdateClick, accountNeedingReconnection, addConnection, repairConnection])

  const profitAndLossSummariesVariants =
    slotProps?.profitAndLoss?.summaries?.variants
  const profitAndLossSummariesReportingVariant =
    slotProps?.profitAndLoss?.summaries?.reportingVariant
  const profitAndLossTagFilter = tagFilter?.tagValues.length
    ? { key: tagFilter.tagKey, values: tagFilter.tagValues }
    : undefined

  return (
    <ProfitAndLoss
      asContainer={false}
      tagFilter={profitAndLossTagFilter}
    >
      <View
        title={stringOverrides?.title || title || t('views:AccountingOverview.label.accounting_overview', 'Accounting overview')}
        viewClassName='Layer__AccountingOverview'
        showHeader={showTitle}
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol>
                <GlobalMonthPicker truncateMonth={sizeClass === 'mobile'} />
              </HeaderCol>
            </HeaderRow>
          </Header>
        )}
      >
        {accountNeedingReconnection && (
          <AccountReconnectionBanner
            accountLabel={accountNeedingReconnection.accountLabel}
            lastSyncedAt={accountNeedingReconnection.lastSyncedAt}
            onClick={handleAccountUpdateClick}
          />
        )}
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLoss?.summaries}
          chartConfig={slotProps?.profitAndLoss?.summaries?.chartConfig}
          chartColorsList={chartColorsList}
          onTransactionsToReviewClick={onTransactionsToReviewClick}
          reportingVariant={profitAndLossSummariesReportingVariant}
          variants={profitAndLossSummariesVariants}
        />
        <Container
          name='accounting-overview-profit-and-loss'
          className='Layer__AccountingOverview__ProfitAndLossContainer'
          asWidget
        >
          <ProfitAndLossHeader
            stringOverrides={{ title: stringOverrides?.header }}
            className='Layer__AccountingOverview__ProfitAndLossHeader'
            trailingContent={<ProfitAndLossLegend direction='row' />}
          />
          <ProfitAndLoss.Chart
            tagFilter={profitAndLossTagFilter}
            hideLegend
            chartConfig={slotProps?.profitAndLoss?.chart?.chartConfig}
          />
        </Container>
        {middleBanner && (
          <Container name='accounting-overview-middle-banner'>
            {middleBanner}
          </Container>
        )}
        <ProfitAndLossOverviewDetailedCharts
          variant='accounting'
          detailedChartsStringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
          chartConfigByScope={{
            revenue: slotProps?.profitAndLoss?.detailedCharts?.revenue?.chartConfig,
            expenses: slotProps?.profitAndLoss?.detailedCharts?.expenses?.chartConfig,
          }}
          chartColorsList={chartColorsList}
        />
      </View>
    </ProfitAndLoss>
  )
}
