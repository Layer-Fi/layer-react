import { useCallback, useMemo } from 'react'
import { fromDate } from '@internationalized/date'
import { getYear } from 'date-fns'
import { Menu as MenuIcon, UserRoundPen } from 'lucide-react'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { getNextTaxFromTaxEstimatesBanner, getTaxEstimatesBannerQuarterStatus, type TaxEstimatesBanner } from '@schemas/taxEstimates/banner'
import type { TaxOverviewCategory, TaxOverviewCategoryKey, TaxOverviewData, TaxOverviewDeadline } from '@schemas/taxEstimates/overview'
import { convertCentsToDecimalString } from '@utils/format'
import { translationKey } from '@utils/i18n/translationKey'
import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useBusinessActivationDate } from '@hooks/features/business/useBusinessActivationDate'
import {
  OnboardingStatus,
  TaxEstimatesRoute,
  TaxEstimatesRouteStoreProvider,
  useTaxEstimatesNavigation,
  useTaxEstimatesOnboardingStatus,
  useTaxEstimatesRouteState,
  useTaxEstimatesYear,
} from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { TaxBanner, type TaxBannerReviewPayload, TaxBannerReviewTypes } from '@components/TaxDetails/TaxBanner'
import { TaxDetails } from '@components/TaxDetails/TaxDetails'
import { TaxOverview } from '@components/TaxOverview/TaxOverview'
import { TaxPayments } from '@components/TaxPayments/TaxPayments'
import { View } from '@components/View/View'
import { YearPicker } from '@components/YearPicker/YearPicker'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

import './taxEstimates.scss'

const TAX_ESTIMATES_MIN_YEAR = 2024

const getTaxBannerReviewPayload = (taxBanner?: TaxEstimatesBanner): TaxBannerReviewPayload | undefined => {
  if (!taxBanner || taxBanner.totalUncategorizedCount <= 0) {
    return
  }

  return {
    type: TaxBannerReviewTypes.UncategorizedTransactions,
    count: taxBanner.totalUncategorizedCount,
    amount: taxBanner.totalUncategorizedSum,
  }
}

export type TaxEstimatesViewProps = {
  onTaxBannerReviewClick?: (payload: TaxBannerReviewPayload) => void
}

export const TaxEstimatesView = ({ onTaxBannerReviewClick }: TaxEstimatesViewProps) => {
  const { t } = useTranslation()
  const { accountingConfiguration } = useLayerContext()

  if (accountingConfiguration?.taxEstimatesEnabled === false) {
    return (
      <View title={t('common:label.taxes', 'Taxes')}>
        <Container name='tax-estimates'>
          <DataState
            status={DataStateStatus.failed}
            title={t('common:state.feature_not_enabled', 'Feature not enabled')}
            description={t(
              'common:label.feature_not_enabled_for_business',
              '{{featureName}} is not enabled.',
              { featureName: t('taxEstimates:label.tax_estimates', 'Tax estimates') },
            )}
            spacing
          />
        </Container>
      </View>
    )
  }

  return (
    <TaxEstimatesRouteStoreProvider>
      <TaxEstimatesViewContent onTaxBannerReviewClick={onTaxBannerReviewClick} />
    </TaxEstimatesRouteStoreProvider>
  )
}

const TaxEstimatesViewContent = ({ onTaxBannerReviewClick }: TaxEstimatesViewProps) => {
  const { t } = useTranslation()
  const onboardingStatus = useTaxEstimatesOnboardingStatus()
  const header = useMemo(
    () => onboardingStatus === OnboardingStatus.Onboarded && <TaxEstimatesViewHeader />,
    [onboardingStatus],
  )

  const viewContent = useMemo(() => {
    switch (onboardingStatus) {
      case OnboardingStatus.Loading:
        return (
          <Container name='tax-estimates'>
            <Loader />
          </Container>
        )

      case OnboardingStatus.Error:
        return (
          <Container name='tax-estimates'>
            <DataState
              status={DataStateStatus.failed}
              title={t('taxEstimates:error.load_tax_information', 'Unable to load tax information')}
              description={t('taxEstimates:error.retrieve_tax_profile', 'We couldn’t retrieve your tax profile. Please check your connection and try again.')}
              spacing
            />
          </Container>
        )

      case OnboardingStatus.Onboarded:
        return <TaxEstimatesOnboardedViewContent onTaxBannerReviewClick={onTaxBannerReviewClick} />

      case OnboardingStatus.NotOnboarded:
      default:
        return <TaxProfile />
    }
  }, [onTaxBannerReviewClick, onboardingStatus, t])

  return (
    <View title='Taxes' header={header}>
      {viewContent}
    </View>
  )
}

const TaxEstimatesViewHeader = () => {
  const { t } = useTranslation()
  const navigate = useTaxEstimatesNavigation()
  const { year, setYear } = useTaxEstimatesYear()
  const activationDate = useBusinessActivationDate()

  const minDateZdt = useMemo(() => {
    const activationYear = activationDate ? getYear(activationDate) : TAX_ESTIMATES_MIN_YEAR
    const effectiveMinYear = Math.max(activationYear, TAX_ESTIMATES_MIN_YEAR)
    return convertDateToZonedDateTime(new Date(effectiveMinYear, 0, 1))
  }, [activationDate])

  const maxDateZdt = useMemo(() => convertDateToZonedDateTime(new Date()), [])

  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined'>
        <MenuIcon size={14} />
      </Button>
    )
  }, [])

  return (
    <HStack gap='xs'>
      <YearPicker
        year={year}
        onChange={setYear}
        minDate={minDateZdt}
        maxDate={maxDateZdt}
      />
      <DropdownMenu
        ariaLabel={t('taxEstimates:label.additional_actions', 'Additional actions')}
        slots={{ Trigger }}
        slotProps={{ Dialog: { width: 160 } }}
      >
        <MenuList>
          <MenuItem key={TaxEstimatesRoute.Profile} onClick={() => navigate(TaxEstimatesRoute.Profile)}>
            <UserRoundPen size={20} strokeWidth={1.25} />
            <Span size='sm'>{t('taxEstimates:action.update_tax_profile', 'Update tax profile')}</Span>
          </MenuItem>
        </MenuList>
      </DropdownMenu>
    </HStack>
  )
}

const TAX_ESTIMATES_TAB_CONFIG = [
  { value: TaxEstimatesRoute.Overview, ...translationKey('common:label.overview', 'Overview') },
  { value: TaxEstimatesRoute.Estimates, ...translationKey('taxEstimates:label.estimates', 'Estimates') },
  { value: TaxEstimatesRoute.Payments, ...translationKey('taxEstimates:label.payments', 'Payments') },
]

const SECTION_TO_CATEGORY_KEY: Record<string, TaxOverviewCategoryKey> = {
  'Federal Income & Self-Employment Tax': 'federal',
  'State Income Tax': 'state',
}

const transformSummaryToCategories = (sections: ReadonlyArray<{ label: string, taxesOwed: number }>): TaxOverviewCategory[] => {
  return sections
    .map((section): TaxOverviewCategory | undefined => {
      const key = SECTION_TO_CATEGORY_KEY[section.label]
      if (!key) return undefined
      return {
        key,
        label: key === 'federal' ? 'Federal + SE' : 'State',
        amount: section.taxesOwed,
      }
    })
    .filter((category): category is TaxOverviewCategory => category !== undefined)
}

const transformBannerToDeadlines = (
  banner: TaxEstimatesBanner,
): TaxOverviewDeadline[] => {
  return banner.quarters.map(quarter => ({
    id: `quarter-${quarter.quarter}`,
    title: `Q${quarter.quarter} taxes`,
    dueAt: fromDate(quarter.dueDate, 'UTC').toDate(),
    amount: quarter.balance,
    description: 'Estimated tax',
    status: getTaxEstimatesBannerQuarterStatus(quarter),
    reviewAction: quarter.uncategorizedCount > 0
      ? {
        payload: {
          type: 'UNCATEGORIZED_TRANSACTIONS' as const,
          count: quarter.uncategorizedCount,
          amount: quarter.uncategorizedSum,
        },
      }
      : undefined,
  }))
}

const TaxEstimatesOnboardedViewContent = ({ onTaxBannerReviewClick }: TaxEstimatesViewProps) => {
  const { t } = useTranslation()
  const { route } = useTaxEstimatesRouteState()
  const navigate = useTaxEstimatesNavigation()
  const { year } = useTaxEstimatesYear()
  const { data: taxBannerData } = useTaxEstimatesBanner({ year })
  const { data: taxOverviewApi } = useTaxOverview({ year })
  const { data: taxSummary } = useTaxSummary({ year })
  const handleTaxBannerReview = useCallback((payload: TaxBannerReviewPayload) => {
    onTaxBannerReviewClick?.(payload)
  }, [onTaxBannerReviewClick])

  const tabOptions = useMemo(
    () => TAX_ESTIMATES_TAB_CONFIG.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const handleTabChange = useCallback((key: Key) => {
    navigate(key as TaxEstimatesRoute)
  }, [navigate])

  const uncategorizedReviewPayload = useMemo(
    () => getTaxBannerReviewPayload(taxBannerData),
    [taxBannerData],
  )
  const nextTax = useMemo(
    () => getNextTaxFromTaxEstimatesBanner(taxBannerData),
    [taxBannerData],
  )

  // Transform API data into the shape expected by TaxOverview component
  const taxOverviewData = useMemo((): TaxOverviewData | undefined => {
    if (!taxOverviewApi || !taxSummary || !taxBannerData || !nextTax) {
      return undefined
    }

    const estimatedTaxCategories = transformSummaryToCategories(taxSummary.sections)
    const paymentDeadlines = transformBannerToDeadlines(taxBannerData)

    return {
      incomeTotal: taxOverviewApi.totalIncome,
      deductionsTotal: taxOverviewApi.totalDeductions,
      estimatedTaxCategories,
      estimatedTaxesTotal: taxSummary.projectedTaxesOwed,
      nextTax,
      paymentDeadlines,
      annualDeadline: {
        id: 'annual-income-taxes',
        title: 'Annual income taxes',
        dueAt: new Date(year + 1, 3, 15), // April 15 of next year (noon UTC to avoid timezone day shift)
        amount: taxSummary.projectedTaxesOwed,
        description: 'Estimated tax',
      },
    }
  }, [taxOverviewApi, taxSummary, taxBannerData, nextTax, year])

  const taxBanner = uncategorizedReviewPayload && (
    <VStack className='Layer__TaxEstimates__TaxBannerWrapper'>
      <TaxBanner
        title={t('taxEstimates:banner.categorization_incomplete.title', 'Your tax estimates are incomplete')}
        description={t(
          'taxEstimates:banner.categorization_incomplete.description',
          `You have ${uncategorizedReviewPayload.count} uncategorized transactions with $${convertCentsToDecimalString(uncategorizedReviewPayload.amount)} in potential deductions to review.`,
        )}
        action={{
          label: t('taxEstimates:action.review_banner', 'Review'),
          onPress: handleTaxBannerReview,
          payload: uncategorizedReviewPayload,
        }}
      />
    </VStack>
  )

  if (route === TaxEstimatesRoute.Profile) {
    return <TaxProfile />
  }

  return (
    <VStack gap='md'>
      <Toggle
        ariaLabel={t('taxEstimates:label.tax_estimate_view', 'Tax estimate view')}
        options={tabOptions}
        selectedKey={route}
        onSelectionChange={handleTabChange}
      />
      {taxBanner}
      {route === TaxEstimatesRoute.Overview && taxOverviewData && nextTax && (
        <TaxOverview
          data={taxOverviewData}
          nextTax={nextTax}
          onTaxBannerReviewClick={onTaxBannerReviewClick}
        />
      )}
      {route === TaxEstimatesRoute.Estimates && <TaxDetails />}
      {route === TaxEstimatesRoute.Payments && <TaxPayments />}
    </VStack>
  )
}
