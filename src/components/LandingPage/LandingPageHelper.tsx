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
        icon: <img src={imageBusinessAccounts} alt={t('landingPage:label.business_bank_accounts_icon', 'Business bank accounts and credit cards connection icon')} />,
        title: t('landingPage:label.connect_business_accounts', 'Connect your business accounts'),
        text: t(
          'landingPage:label.connect_business_bank_accounts',
          'Connect your business bank accounts and credit cards right within {{platformName}}.',
          { platformName },
        ),
      },
      {
        icon: <img src={imageCategorizeExpenses} alt={t('landingPage:label.expense_categorization_organization_icon', 'Expense categorization and organization icon')} />,
        title: t('landingPage:label.categorize_expenses', 'Categorize expenses'),
        text: t(
          'landingPage:label.organize_transaction_into_categories',
          'Organize transactions into categories built for {{industry}}.',
          { industry },
        ),
      },
      {
        icon: <img src={imageBusinessOverview} alt={t('landingPage:label.business_overview_dashboard_charts', 'Business overview dashboard with charts and financial metrics')} />,
        title: t('landingPage:label.get_clear_picture_of_business', 'Get a clear picture of your business'),
        text: t('landingPage:label.see_business_profitability', 'See your business profitability and stay organized for tax time.'),
      },
    ]

    return {
      badge: t('landingPage:label.easy_to_use_software', 'Easy to use software'),
      cta: {
        label: t('landingPage:action.get_started', 'Get Started'),
        url: '/',
      },
      title: t('landingPage:label.platform_name_accounting', '{{platformName}} Accounting', { platformName }),
      description: t(
        'landingPage:label.best_accounting_software_for_industry',
        'The best accounting software for {{industry}} businesses. Fast to set up and easy to use.',
        { industry },
      ),
      features: [
        {
          icon: <Check size={14} />,
          description: t('landingPage:label.direct_integration_with_platform_name', 'Direct integration with {{platformName}}', { platformName }),
        },
        { icon: <Check size={14} />, description: t('landingPage:label.track_expenses_and_receipts', 'Track expenses and receipts') },
        { icon: <Check size={14} />, description: t('landingPage:label.easy_to_understand_profitability_charts', 'Easy to understand profitability charts and reports') },
      ],
      unit: '/month',
      pricing: '$299',
      valueProposition: accountingValueProps,
    }
  }

  static createBaseBookkeepingOffer(_platformConfig: LandingPagePlatformConfig, t: TFunction): LandingPageConfig {
    const bookkeepingValueProps: LandingPageValueProposition[] = [
      {
        icon: <img src={imageScheduleBookkeeperMeeting} alt={t('landingPage:label.calendar_scheduling_icon_bookkeeper', 'Calendar scheduling icon for bookkeeper consultation')} />,
        title: t('landingPage:label.schedule_call_with_bookkeeper', 'Schedule a call with your Bookkeeper'),
        text: t('landingPage:label.get_personalized_guidance', 'Get personalized guidance from your dedicated bookkeeper to review your finances and answer questions.'),
      },
      {
        icon: <img src={imageBookkeeperInquiries} alt={t('landingPage:label.notification_bell_icon_bookkeeping', 'Notification bell icon for bookkeeping task updates and clarifications')} />,
        title: t('landingPage:label.get_notified_on_bookkeeping_clarifications', 'Get notified on bookkeeping clarifications'),
        text: t('landingPage:label.receive_clear_notifications', 'Receive clear notifications when your bookkeeper needs additional information or clarification on transactions.'),
      },
      {
        icon: <img src={imagePnlOverview} alt={t('landingPage:label.profit_loss_statement_chart', 'Profit and loss statement chart for tax preparation and business analysis')} />,
        title: t('landingPage:label.get_ready_for_tax_season', 'Get ready for tax season'),
        text: t('landingPage:label.books_organized_and_tax_ready', 'Your books will be organized and tax-ready with accurate categorization and financial statements prepared by professionals.'),
      },
    ]

    return {
      badge: t('landingPage:label.complete_bookkeeping_service', 'A complete bookkeeping service'),
      cta: {
        label: t('landingPage:action.get_started', 'Get Started'),
        url: '/',
      },
      title: t('landingPage:label.full_service_bookkeeping', 'Full-service Bookkeeping'),
      description: t('landingPage:label.get_dedicated_bookkeeper', 'Get a dedicated bookkeeper who will organize and manage your books for you.'),
      features: [
        { icon: <Check size={14} />, description: t('landingPage:label.personalized_setup_bookkeeper', 'Personalized setup with your bookkeeper') },
        { icon: <Check size={14} />, description: t('landingPage:label.monthly_books_done_for_you', 'Monthly books done for you') },
        { icon: <Check size={14} />, description: t('landingPage:label.complete_financial_reports', 'Complete financial reports and end of year tax packet') },
      ],
      unit: '/month',
      pricing: '$599',
      valueProposition: bookkeepingValueProps,
    }
  }
}
