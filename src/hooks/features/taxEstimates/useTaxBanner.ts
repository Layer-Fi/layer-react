import { useTranslation } from 'react-i18next'

import { type TaxEstimatesBanner } from '@schemas/taxEstimates/banner'
import { DateFormat } from '@utils/i18n/date/patterns'
import { tPlural } from '@utils/i18n/plural'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'

type UseTaxBannerResult = {
  bannerDescription: string
}

export function useTaxBanner(data: TaxEstimatesBanner): UseTaxBannerResult {
  const { t } = useTranslation()
  const { formatCurrencyFromCents, formatDate, formatDateRange } = useIntlFormatter()
  const { isTablet, isMobile } = useSizeClass()

  const {
    year,
    totalUncategorizedCount: count,
    totalUncategorizedMoneyIn: moneyIn,
    totalUncategorizedMoneyOut: moneyOut,
    earliestUncategorizedAt,
    latestUncategorizedAt,
  } = data

  const deductions = formatCurrencyFromCents(moneyOut)
  const income = formatCurrencyFromCents(moneyIn)

  if (isTablet || isMobile) {
    return {
      bannerDescription: tPlural(t, 'taxEstimates:banner.categorization_incomplete.description_short', {
        count,
        deductions,
        income,
        one: 'You have {{count}} uncategorized transaction: {{deductions}} in deductions and {{income}} in unrecognized income.',
        other: 'You have {{count}} uncategorized transactions: {{deductions}} in deductions and {{income}} in unrecognized income.',
      }),
    }
  }

  const hasDateRange = Boolean(earliestUncategorizedAt && latestUncategorizedAt)
  if (hasDateRange && earliestUncategorizedAt && latestUncategorizedAt) {
    const isSameDay = earliestUncategorizedAt.getFullYear() === latestUncategorizedAt.getFullYear()
      && earliestUncategorizedAt.getMonth() === latestUncategorizedAt.getMonth()
      && earliestUncategorizedAt.getDate() === latestUncategorizedAt.getDate()
    const dateRange = isSameDay
      ? formatDate(earliestUncategorizedAt, DateFormat.DateShort)
      : formatDateRange(earliestUncategorizedAt, latestUncategorizedAt, DateFormat.DateShort)

    return {
      bannerDescription: tPlural(t, 'taxEstimates:banner.categorization_incomplete.description_with_range', {
        count,
        year,
        dateRange,
        deductions,
        income,
        one: 'In tax year {{year}}, you have {{count}} uncategorized transaction spanning {{dateRange}} with potentially {{deductions}} in deductions and {{income}} in unrecognized income. Review and categorize your transactions for more accurate estimates.',
        other: 'In tax year {{year}}, you have {{count}} uncategorized transactions spanning from {{dateRange}} with potentially {{deductions}} in deductions and {{income}} in unrecognized income. Review and categorize your transactions for more accurate estimates.',
      }),
    }
  }

  return {
    bannerDescription: tPlural(t, 'taxEstimates:banner.categorization_incomplete.description', {
      count,
      year,
      deductions,
      income,
      one: 'In tax year {{year}}, you have {{count}} uncategorized transaction with potentially {{deductions}} in deductions and {{income}} in unrecognized income. Review and categorize your transactions for more accurate estimates.',
      other: 'In tax year {{year}}, you have {{count}} uncategorized transactions with potentially {{deductions}} in deductions and {{income}} in unrecognized income. Review and categorize your transactions for more accurate estimates.',
    }),
  }
}
