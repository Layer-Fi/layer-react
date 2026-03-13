import type { TFunction } from 'i18next'
import i18next from 'i18next'
import { Check } from 'lucide-react'

import { type LandingPageConfig, type LandingPagePlatformConfig, type LandingPageValueProposition } from '@components/LandingPage/types'
import {
  imageBookkeeperInquiries,
  imageBusinessAccounts,
  imageBusinessOverview,
  imageCategorizeExpenses,
  imagePnlOverview,
  imageScheduleBookkeeperMeeting,
} from '@assets/images'

export class LandingPageHelper {
  static interpolateTemplate(template: string, platformConfig: LandingPagePlatformConfig): string {
    const interpolationOptions = i18next.options.interpolation ?? {}

    return i18next.services.interpolator.interpolate(template, {
      platformName: platformConfig.platformName,
      industry: platformConfig.industry,
    }, i18next.language, interpolationOptions)
  }

  static createBaseAccountingOffer(platformConfig: LandingPagePlatformConfig, t: TFunction): LandingPageConfig {
    const { platformName, industry } = platformConfig
    const accountingValueProps: LandingPageValueProposition[] = [
      {
        icon: <img src={imageBusinessAccounts} alt={t('businessBankAccountsAndCreditCardsConnectionIcon', 'Business bank accounts and credit cards connection icon')} />,
        title: t('connectYourBusinessAccounts', 'Connect your business accounts'),
        text: t(
          'connectYourBusinessBankAccountsAndCreditCardsRightWithinPlatformName',
          'Connect your business bank accounts and credit cards right within {{platformName}}.',
          { platformName },
        ),
      },
      {
        icon: <img src={imageCategorizeExpenses} alt={t('expenseCategorizationAndOrganizationIcon', 'Expense categorization and organization icon')} />,
        title: t('categorizeExpenses', 'Categorize expenses'),
        text: t(
          'organizeTransactionsIntoCategoriesBuiltForIndustry',
          'Organize transactions into categories built for {{industry}}.',
          { industry },
        ),
      },
      {
        icon: <img src={imageBusinessOverview} alt={t('businessOverviewDashboardWithChartsAndFinancialMetrics', 'Business overview dashboard with charts and financial metrics')} />,
        title: t('getAClearPictureOfYourBusiness', 'Get a clear picture of your business'),
        text: t('seeYourBusinessProfitabilityAndStayOrganizedForTaxTime', 'See your business profitability and stay organized for tax time.'),
      },
    ]

    return {
      badge: t('easyToUseSoftware', 'Easy to use software'),
      cta: {
        label: t('getStartedButtonLabel', 'Get Started'),
        url: '/',
      },
      title: t('platformNameAccounting', '{{platformName}} Accounting', { platformName }),
      description: t(
        'theBestAccountingSoftwareForIndustryBusinessesFastToSetUpAndEasyToUse',
        'The best accounting software for {{industry}} businesses. Fast to set up and easy to use.',
        { industry },
      ),
      features: [
        {
          icon: <Check size={14} />,
          description: t('directIntegrationWithPlatformName', 'Direct integration with {{platformName}}', { platformName }),
        },
        { icon: <Check size={14} />, description: t('trackExpensesAndReceipts', 'Track expenses and receipts') },
        { icon: <Check size={14} />, description: t('easyToUnderstandProfitabilityChartsAndReports', 'Easy to understand profitability charts and reports') },
      ],
      unit: '/month',
      pricing: '$299',
      valueProposition: accountingValueProps,
    }
  }

  static createBaseBookkeepingOffer(_platformConfig: LandingPagePlatformConfig, t: TFunction): LandingPageConfig {
    const bookkeepingValueProps: LandingPageValueProposition[] = [
      {
        icon: <img src={imageScheduleBookkeeperMeeting} alt={t('calendarSchedulingIconForBookkeeperConsultation', 'Calendar scheduling icon for bookkeeper consultation')} />,
        title: t('scheduleACallWithYourBookkeeper', 'Schedule a call with your Bookkeeper'),
        text: t('getPersonalizedGuidanceFromYourDedicatedBookkeeperToReviewYourFinancesAndAnswerQuestions', 'Get personalized guidance from your dedicated bookkeeper to review your finances and answer questions.'),
      },
      {
        icon: <img src={imageBookkeeperInquiries} alt={t('notificationBellIconForBookkeepingTaskUpdatesAndClarifications', 'Notification bell icon for bookkeeping task updates and clarifications')} />,
        title: t('getNotifiedOnBookkeepingClarifications', 'Get notified on bookkeeping clarifications'),
        text: t('receiveClearNotificationsWhenYourBookkeeperNeedsAdditionalInformationOrClarificationOnTransactions', 'Receive clear notifications when your bookkeeper needs additional information or clarification on transactions.'),
      },
      {
        icon: <img src={imagePnlOverview} alt={t('profitAndLossStatementChartForTaxPreparationAndBusinessAnalysis', 'Profit and loss statement chart for tax preparation and business analysis')} />,
        title: t('getReadyForTaxSeason', 'Get ready for tax season'),
        text: t('yourBooksWillBeOrganizedAndTaxreadyWithAccurateCategorizationAndFinancialStatementsPreparedByProfessionals', 'Your books will be organized and tax-ready with accurate categorization and financial statements prepared by professionals.'),
      },
    ]

    return {
      badge: t('aCompleteBookkeepingService', 'A complete bookkeeping service'),
      cta: {
        label: t('getStartedButtonLabel', 'Get Started'),
        url: '/',
      },
      title: t('fullServiceBookkeeping', 'Full-service Bookkeeping'),
      description: t('getADedicatedBookkeeperWhoWillOrganizeAndManageYourBooksForYou', 'Get a dedicated bookkeeper who will organize and manage your books for you.'),
      features: [
        { icon: <Check size={14} />, description: t('personalizedSetupWithYourBookkeeper', 'Personalized setup with your bookkeeper') },
        { icon: <Check size={14} />, description: t('monthlyBooksDoneForYou', 'Monthly books done for you') },
        { icon: <Check size={14} />, description: t('completeFinancialReportsAndEndOfYearTaxPacket', 'Complete financial reports and end of year tax packet') },
      ],
      unit: '/month',
      pricing: '$599',
      valueProposition: bookkeepingValueProps,
    }
  }
}
