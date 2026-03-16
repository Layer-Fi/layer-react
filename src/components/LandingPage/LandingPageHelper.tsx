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
        icon: <img src={imageBusinessAccounts} alt={t('landingPage.businessBankAccountsAndCreditCardsConnectionIcon', 'Business bank accounts and credit cards connection icon')} />,
        title: t('landingPage.connectYourBusinessAccounts', 'Connect your business accounts'),
        text: t(
          'landingPage.connectYourBusinessBankAccountsAndCreditCardsRightWithinPlatformName',
          'Connect your business bank accounts and credit cards right within {{platformName}}.',
          { platformName },
        ),
      },
      {
        icon: <img src={imageCategorizeExpenses} alt={t('landingPage.expenseCategorizationAndOrganizationIcon', 'Expense categorization and organization icon')} />,
        title: t('landingPage.categorizeExpenses', 'Categorize expenses'),
        text: t(
          'landingPage.organizeTransactionsIntoCategoriesBuiltForIndustry',
          'Organize transactions into categories built for {{industry}}.',
          { industry },
        ),
      },
      {
        icon: <img src={imageBusinessOverview} alt={t('landingPage.businessOverviewDashboardWithChartsAndFinancialMetrics', 'Business overview dashboard with charts and financial metrics')} />,
        title: t('landingPage.getAClearPictureOfYourBusiness', 'Get a clear picture of your business'),
        text: t('landingPage.seeYourBusinessProfitabilityAndStayOrganizedForTaxTime', 'See your business profitability and stay organized for tax time.'),
      },
    ]

    return {
      badge: t('landingPage.easyToUseSoftware', 'Easy to use software'),
      cta: {
        label: t('landingPage.getStartedButtonLabel', 'Get Started'),
        url: '/',
      },
      title: t('landingPage.platformNameAccounting', '{{platformName}} Accounting', { platformName }),
      description: t(
        'landingPage.theBestAccountingSoftwareForIndustryBusinessesFastToSetUpAndEasyToUse',
        'The best accounting software for {{industry}} businesses. Fast to set up and easy to use.',
        { industry },
      ),
      features: [
        {
          icon: <Check size={14} />,
          description: t('landingPage.directIntegrationWithPlatformName', 'Direct integration with {{platformName}}', { platformName }),
        },
        { icon: <Check size={14} />, description: t('landingPage.trackExpensesAndReceipts', 'Track expenses and receipts') },
        { icon: <Check size={14} />, description: t('landingPage.easyToUnderstandProfitabilityChartsAndReports', 'Easy to understand profitability charts and reports') },
      ],
      unit: '/month',
      pricing: '$299',
      valueProposition: accountingValueProps,
    }
  }

  static createBaseBookkeepingOffer(_platformConfig: LandingPagePlatformConfig, t: TFunction): LandingPageConfig {
    const bookkeepingValueProps: LandingPageValueProposition[] = [
      {
        icon: <img src={imageScheduleBookkeeperMeeting} alt={t('landingPage.calendarSchedulingIconForBookkeeperConsultation', 'Calendar scheduling icon for bookkeeper consultation')} />,
        title: t('landingPage.scheduleACallWithYourBookkeeper', 'Schedule a call with your Bookkeeper'),
        text: t('landingPage.getPersonalizedGuidanceFromYourDedicatedBookkeeperToReviewYourFinancesAndAnswerQuestions', 'Get personalized guidance from your dedicated bookkeeper to review your finances and answer questions.'),
      },
      {
        icon: <img src={imageBookkeeperInquiries} alt={t('landingPage.notificationBellIconForBookkeepingTaskUpdatesAndClarifications', 'Notification bell icon for bookkeeping task updates and clarifications')} />,
        title: t('landingPage.getNotifiedOnBookkeepingClarifications', 'Get notified on bookkeeping clarifications'),
        text: t('landingPage.receiveClearNotificationsWhenYourBookkeeperNeedsAdditionalInformationOrClarificationOnTransactions', 'Receive clear notifications when your bookkeeper needs additional information or clarification on transactions.'),
      },
      {
        icon: <img src={imagePnlOverview} alt={t('landingPage.profitAndLossStatementChartForTaxPreparationAndBusinessAnalysis', 'Profit and loss statement chart for tax preparation and business analysis')} />,
        title: t('landingPage.getReadyForTaxSeason', 'Get ready for tax season'),
        text: t('landingPage.yourBooksWillBeOrganizedAndTaxreadyWithAccurateCategorizationAndFinancialStatementsPreparedByProfessionals', 'Your books will be organized and tax-ready with accurate categorization and financial statements prepared by professionals.'),
      },
    ]

    return {
      badge: t('landingPage.aCompleteBookkeepingService', 'A complete bookkeeping service'),
      cta: {
        label: t('landingPage.getStartedButtonLabel', 'Get Started'),
        url: '/',
      },
      title: t('landingPage.fullServiceBookkeeping', 'Full-service Bookkeeping'),
      description: t('landingPage.getADedicatedBookkeeperWhoWillOrganizeAndManageYourBooksForYou', 'Get a dedicated bookkeeper who will organize and manage your books for you.'),
      features: [
        { icon: <Check size={14} />, description: t('landingPage.personalizedSetupWithYourBookkeeper', 'Personalized setup with your bookkeeper') },
        { icon: <Check size={14} />, description: t('landingPage.monthlyBooksDoneForYou', 'Monthly books done for you') },
        { icon: <Check size={14} />, description: t('landingPage.completeFinancialReportsAndEndOfYearTaxPacket', 'Complete financial reports and end of year tax packet') },
      ],
      unit: '/month',
      pricing: '$599',
      valueProposition: bookkeepingValueProps,
    }
  }
}
