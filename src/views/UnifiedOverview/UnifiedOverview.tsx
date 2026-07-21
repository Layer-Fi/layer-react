import { useTranslation } from 'react-i18next'

import { type PlaidHostedLinkConfig } from '@schemas/linkedAccounts/plaid'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { type SummaryCardInteractionProps, type SummaryCardStringOverrides } from '@ui/SummaryCard/useSummaryCardSlots'
import { ExpensesSummaryCard } from '@components/ExpensesSummaryCard/ExpensesSummaryCard'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { MileageTrackingSummary } from '@components/MileageTrackingSummary/MileageTrackingSummary'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesReportingVariant,
  type ProfitAndLossSummariesSlotProps,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossSummaryCard } from '@components/ProfitAndLossSummaryCard/ProfitAndLossSummaryCard'
import { SolopreneurOnboardingBanner } from '@components/SolopreneurOnboardingBanner/SolopreneurOnboardingBanner'
import {
  TaxEstimatesSummaryCard,
  TaxEstimatesSummaryCardMode,
} from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { View } from '@components/View/View'
import { useOverviewConfiguration } from '@hooks/api/businesses/[business-id]/overview/useOverviewConfig'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Card, CardType } from '@schemas/overview/card'

import "./unifiedOverview.scss"
import { VStack } from '@ui/Stack/Stack'
import { BookkeepingOverviewTasksContent } from '@views/BookkeepingOverview/BookkeepingOverview'
import { useBookkeepingOnboardingCallBooking } from '@hooks/features/bookkeeping/useBookkeepingOnboardingCallBooking'
import { useCallback, useMemo } from 'react'
import { useKeepInMobileViewport } from '@views/BookkeepingOverview/useKeepInMobileViewport'

type InteractionMap = Partial<Record<CardType, () => void>>

// Should probably live in a seperate file
const CardDisplay = ({
  card,
  interactionMap
}: {
  card: Card
  interactionMap?: InteractionMap
}) => {
  const stringOverrides = useMemo(() => {
    // TODO: Should differentiate by card type to generate specific typesafe overrides
    // Ok for now as all cards take the same override object
    return {
      title: card.title
    }
  }, [card.title])

  const interactionProps = useMemo(() => {
    if (!interactionMap) {
      return undefined
    }

    const callback = interactionMap[card.cardType]

    if (!callback) {
      return undefined
    }

    return {
      onClickExpand: callback
    }
  }, [card, interactionMap])

  switch (card.cardType) {
    case CardType.ProfitAndLoss:
      
      return <ProfitAndLossSummaryCard stringOverrides={stringOverrides} interactionProps={interactionProps}/>

    case CardType.TaxSummary:
      return <TaxEstimatesSummaryCard stringOverrides={stringOverrides} interactionProps={interactionProps}/>

    case CardType.Expenses:
      return <ExpensesSummaryCard stringOverrides={stringOverrides} interactionProps={interactionProps}/>

      case CardType.Mileage:
      return <MileageTrackingSummary stringOverrides={stringOverrides} interactionProps={interactionProps}/>
  }
  // Handles error case
  return null
}

//
const Banner = ({
  banner
}: {
  banner: string
}) => {
  // TODO: Should determine if/which banner to display based off config props. For now, always display 
  if (banner === "solopreneur") {
    return <SolopreneurOnboardingBanner/>
  }

  return null
}

// Allows for conditionally calling booking hook/component
const WrappedBookkeepingOverviewTasksContent = ({
}) => {
  const {
    callBooking,
    showCallBookingCard,
    handleBookCall,
    // TODO: Also inject calendly support
    isCalendlyVisible,
    calendlyLink,
    calendlyRef,
    closeCalendly,
  } = useBookkeepingOnboardingCallBooking()

  return <BookkeepingOverviewTasksContent
    callBooking={callBooking}
    showCallBookingCard={showCallBookingCard}
    tasksMobile={false}
    onBookCall={handleBookCall}
  />
}

export interface UnifiedOverviewProps {
  chartColorsList?: string[]
  interactionMap?: InteractionMap
  slotProps?: {
    profitAndLoss?: {
      summaries?: ProfitAndLossSummariesSlotProps
    }
  }
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
}

export const UnifiedOverview = ({
  chartColorsList,
  interactionMap
}: UnifiedOverviewProps) => {
    const { t } = useTranslation()
    const { value: sizeClass } = useSizeClass()
    const [width] = useWindowSize()


    const { businessId } = useLayerContext()
    const { data: config, isError, isLoading} = useOverviewConfiguration({ businessId })

    const { upperContentRef, targetElementRef, upperElementInFocus } = useKeepInMobileViewport()

    const BookKeepingComponent = useMemo(() => {
      if (config && config.showBookKeeping) {
        return  <WrappedBookkeepingOverviewTasksContent />
      }
      return null
    }, [config])

    if (!config || isLoading || isError) {
      // TODO: Replace with loading and error states
      return null
    }

    const displaySidebar = config.showBookKeeping && width > 1100
    const displayInColumnBookKeeper = config.showBookKeeping && width <= 1100

    return <ProfitAndLoss asContainer={false}>
        <View
        title={config.title || t('common:label.overview', 'Overview')}
        showHeader
        withSidebar={displaySidebar}
        sidebar={(
          <VStack gap='lg'>
            {BookKeepingComponent}
          </VStack>
        )}
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
        {/* <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLossSummaries}
          chartColorsList={chartColorsList}
          reportingVariant={
            slotProps?.profitAndLoss?.summaries?.reportingVariant
            ?? SOLOPRENEUR_OVERVIEW_DEFAULT_REPORTING_VARIANT
          }
          variants={slotProps?.profitAndLoss?.summaries?.variants}
          onTransactionsToReviewClick={interactionProps?.cashflowSummaries?.onTransactionsToReviewClick}
        /> */}
        <Banner banner={config.bannerProps}/>

        <ProfitAndLossSummaries chartColorsList={chartColorsList}/>

        {displayInColumnBookKeeper && (
          <div
            ref={upperContentRef}
            onClick={() => (upperElementInFocus.current = true)}
          >
            <VStack gap='lg'>
              <WrappedBookkeepingOverviewTasksContent />
            </VStack>
          </div>
        )}

        
        <div className="Layer__UnifiedOverview__Grid" ref={targetElementRef}>
          {
            config.cards.map((card) => {
              return <div className={`Layer__UnifiedOverview__Grid__GridSize${card.numColumns}`}>
                  <CardDisplay card={card} interactionMap={interactionMap}/>
              </div>
            })
          }
        </div>
      </View>
    </ProfitAndLoss>
}