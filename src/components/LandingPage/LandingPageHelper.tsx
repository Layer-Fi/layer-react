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

  static createBaseAccountingOffer(platformConfig: LandingPagePlatformConfig): LandingPageConfig {
    const { platformName, industry } = platformConfig
    const accountingValueProps: LandingPageValueProposition[] = [
      {
        icon: <img src={imageBusinessAccounts} alt={i18next.t('businessBankAccountsAndCreditCardsConnectionIcon', 'Business bank accounts and credit cards connection icon')} />,
        title: i18next.t('connectYourBusinessAccounts', 'Connect your business accounts'),
        text: i18next.t(
          'connectYourBusinessBankAccountsAndCreditCardsRightWithinPlatformname',
          'Connect your business bank accounts and credit cards right within {{platformName}}.',
          { platformName },
        ),
      },
      {
        icon: <img src={imageCategorizeExpenses} alt={i18next.t('expenseCategorizationAndOrganizationIcon', 'Expense categorization and organization icon')} />,
        title: i18next.t('categorizeExpenses', 'Categorize expenses'),
        text: i18next.t(
          'organizeTransactionsIntoCategoriesBuiltForIndustry',
          'Organize transactions into categories built for {{industry}}.',
          { industry },
        ),
      },
      {
        icon: <img src={imageBusinessOverview} alt={i18next.t('businessOverviewDashboardWithChartsAndFinancialMetrics', 'Business overview dashboard with charts and financial metrics')} />,
        title: i18next.t('getAClearPictureOfYourBusiness', 'Get a clear picture of your business'),
        text: i18next.t('seeYourBusinessProfitabilityAndStayOrganizedForTaxTime', 'See your business profitability and stay organized for tax time.'),
      },
    ]

    return {
      badge: i18next.t('easyToUseSoftware', 'Easy to use software'),
      cta: {
        label: i18next.t('getStartedButtonLabel', 'Get Started'),
        url: '/',
      },
      title: i18next.t('platformnameAccounting', '{{platformName}} Accounting', { platformName }),
      description: i18next.t(
        'theBestAccountingSoftwareForIndustryBusinessesFastToSetUpAndEasyToUse',
        'The best accounting software for {{industry}} businesses. Fast to set up and easy to use.',
        { industry },
      ),
      features: [
        {
          icon: <Check size={14} />,
          description: i18next.t('directIntegrationWithPlatformname', 'Direct integration with {{platformName}}', { platformName }),
        },
        { icon: <Check size={14} />, description: i18next.t('trackExpensesAndReceipts', 'Track expenses and receipts') },
        { icon: <Check size={14} />, description: i18next.t('easyToUnderstandProfitabilityChartsAndReports', 'Easy to understand profitability charts and reports') },
      ],
      unit: '/month',
      pricing: '$299',
      valueProposition: accountingValueProps,
    }
  }

  static createBaseBookkeepingOffer(_platformConfig: LandingPagePlatformConfig): LandingPageConfig {
    const bookkeepingValueProps: LandingPageValueProposition[] = [
      {
        icon: <img src={imageScheduleBookkeeperMeeting} alt={i18next.t('calendarSchedulingIconForBookkeeperConsultation', 'Calendar scheduling icon for bookkeeper consultation')} />,
        title: i18next.t('scheduleACallWithYourBookkeeper', 'Schedule a call with your Bookkeeper'),
        text: i18next.t('getPersonalizedGuidanceFromYourDedicatedBookkeeperToReviewYourFinancesAndAnswerQuestions', 'Get personalized guidance from your dedicated bookkeeper to review your finances and answer questions.'),
      },
      {
        icon: <img src={imageBookkeeperInquiries} alt={i18next.t('notificationBellIconForBookkeepingTaskUpdatesAndClarifications', 'Notification bell icon for bookkeeping task updates and clarifications')} />,
        title: i18next.t('getNotifiedOnBookkeepingClarifications', 'Get notified on bookkeeping clarifications'),
        text: i18next.t('receiveClearNotificationsWhenYourBookkeeperNeedsAdditionalInformationOrClarificationOnTransactions', 'Receive clear notifications when your bookkeeper needs additional information or clarification on transactions.'),
      },
      {
        icon: <img src={imagePnlOverview} alt={i18next.t('profitAndLossStatementChartForTaxPreparationAndBusinessAnalysis', 'Profit and loss statement chart for tax preparation and business analysis')} />,
        title: i18next.t('getReadyForTaxSeason', 'Get ready for tax season'),
        text: i18next.t('yourBooksWillBeOrganizedAndTaxreadyWithAccurateCategorizationAndFinancialStatementsPreparedByProfessionals', 'Your books will be organized and tax-ready with accurate categorization and financial statements prepared by professionals.'),
      },
    ]

    return {
      badge: i18next.t('aCompleteBookkeepingService', 'A complete bookkeeping service'),
      cta: {
        label: i18next.t('getStartedButtonLabel', 'Get Started'),
        url: '/',
      },
      title: i18next.t('fullserviceBookkeeping', 'Full-service Bookkeeping'),
      description: i18next.t('getADedicatedBookkeeperWhoWillOrganizeAndManageYourBooksForYou', 'Get a dedicated bookkeeper who will organize and manage your books for you.'),
      features: [
        { icon: <Check size={14} />, description: i18next.t('personalizedSetupWithYourBookkeeper', 'Personalized setup with your bookkeeper') },
        { icon: <Check size={14} />, description: i18next.t('monthlyBooksDoneForYou', 'Monthly books done for you') },
        { icon: <Check size={14} />, description: i18next.t('completeFinancialReportsAndEndOfYearTaxPacket', 'Complete financial reports and end of year tax packet') },
      ],
      unit: '/month',
      pricing: '$599',
      valueProposition: bookkeepingValueProps,
    }
  }
}
