import { LandingPagePlatformConfig, LandingPageConfig, LandingPageValueProposition } from './types'
import {
  imageBusinessAccounts,
  imageBusinessOverview,
  imageCategorizeExpenses,
  imageBookkeeperInquiries,
  imageScheduleBookkeeperMeeting,
  imagePnlOverview,
} from '../../assets/images'
import {
  LandingPageContentID,
  LandingPageTypesTextContent,
  LandingPageDefaultTextContent,
  ContentConfig,
  PartialContentConfig,
  landingPageDefaultContentConfig,
} from './content'
import { Check } from 'lucide-react'

/**
 * Helper class to create defaults for the Landing Pages and override them, as well
 * as generate the base content configs.
 @see createBaseAccountingOffer
 @see createBaseBookkeepingOffer
 @see createContentConfig
 */
export class LandingPageHelper {
  /**
   * Creates dynamic text by replacing template variables with platform config values
   */
  static makeDynamicText(
    contentId: LandingPageContentID,
    textContent: LandingPageTypesTextContent,
    platformConfig: LandingPagePlatformConfig,
  ): string {
    const variableMap = {
      platformName: platformConfig.platformName,
      industry: platformConfig.industry,
    }

    // Try to use the provided text content. If it doesn't exist, we'll use values from the default.
    const template = textContent[contentId] ?? LandingPageDefaultTextContent[contentId]

    return this.bindTextValues(template, variableMap)
  }

  /**
   * Binds template variables in a string with platform configuration values
   */
  static bindTextValues(template: string, platformConfig: LandingPagePlatformConfig): string
  static bindTextValues(template: string, variableMap: Record<string, string>): string
  static bindTextValues(
    template: string,
    configOrMap: LandingPagePlatformConfig | Record<string, string>,
  ): string {
    let variableMap: Record<string, string>

    if ('platformName' in configOrMap && 'industry' in configOrMap) {
      // It's a PlatformConfig
      variableMap = {
        platformName: configOrMap.platformName,
        industry: configOrMap.industry,
      }
    }
    else {
      // It's already a variable map
      variableMap = configOrMap
    }

    return template.replace(/{(\w+)}/g, (match, key) => {
      return variableMap[key as keyof typeof variableMap] || match
    })
  }

  /**
   * Generates a `LandingPageConfig` with the default values for offering
   * Layer's accounting service. Recommended when you want minimal changes for
   * the standard accounting offer.
   *
   * Default settings are set to a base pricing of $299/month, which can be
   * overwritten using `overwriteBaseOffer`.
   *
   * @see LandingPageHelper.overwriteBaseOffer
   */
  static createBaseAccountingOffer(platformConfig: LandingPagePlatformConfig): LandingPageConfig {
    const accountingValueProps: LandingPageValueProposition[] = [
      {
        icon: <img src={imageBusinessAccounts} alt='Business bank accounts and credit cards connection icon' />,
        title: 'Connect your business accounts',
        text: 'Connect your business bank accounts and credit cards right within {platformName}.',
      },
      {
        icon: <img src={imageCategorizeExpenses} alt='Expense categorization and organization icon' />,
        title: 'Categorize expenses',
        text: 'Organize transactions into categories built for {industry}.',
      },
      {
        icon: <img src={imageBusinessOverview} alt='Business overview dashboard with charts and financial metrics' />,
        title: 'Get a clear picture of your business',
        text: 'See your business profitability and stay organized for tax time.',
      },
    ]

    return {
      badge: 'Easy to use software',
      cta: {
        label: 'Get Started',
        url: '/',
      },
      title: '{platformName} Accounting',
      description: 'The best accounting software for {industry} businesses. Fast to set up and easy to use.',
      features: [
        { icon: <Check size={14} />, description: 'Direct integration with {platformName}' },
        { icon: <Check size={14} />, description: 'Track expenses and receipts' },
        { icon: <Check size={14} />, description: 'Easy to understand profitability charts and reports' },
      ],
      unit: '/month',
      pricing: '$299',
      valueProposition: accountingValueProps.map(vp => ({
        ...vp,
        text: this.bindTextValues(vp.text, platformConfig),
      })),
    }
  }

  /**
   * Generates a `LandingPageConfig` with the default values for offering
   * Layer's bookkeeping service. Recommended when you want minimal changes for
   * the standard bookkeeping offer.
   *
   * Default settings are set to a base pricing of $599/month, which can be
   * overwritten using `overwriteBaseOffer`.
   *
   * @see LandingPageHelper.overwriteBaseOffer
   */
  static createBaseBookkeepingOffer(platformConfig: LandingPagePlatformConfig): LandingPageConfig {
    const bookkeepingValueProps: LandingPageValueProposition[] = [
      {
        icon: <img src={imageScheduleBookkeeperMeeting} alt='Calendar scheduling icon for bookkeeper consultation' />,
        title: 'Schedule a call with your Bookkeeper',
        text: 'Get personalized guidance from your dedicated bookkeeper to review your finances and answer questions.',
      },
      {
        icon: <img src={imageBookkeeperInquiries} alt='Notification bell icon for bookkeeping task updates and clarifications' />,
        title: 'Get notified on bookkeeping clarifications',
        text: 'Receive clear notifications when your bookkeeper needs additional information or clarification on transactions.',
      },
      {
        icon: <img src={imagePnlOverview} alt='Profit and loss statement chart for tax preparation and business analysis' />,
        title: 'Get ready for tax season',
        text: 'Your books will be organized and tax-ready with accurate categorization and financial statements prepared by professionals.',
      },
    ]

    return {
      badge: 'A complete bookkeeping service',
      cta: {
        label: 'Get Started',
        url: '/',
      },
      title: 'Full-service Bookkeeping',
      description: 'Get a dedicated bookkeeper who will organize and manage your books for you.',
      features: [
        { icon: <Check size={14} />, description: 'Personalized setup with your bookkeeper' },
        { icon: <Check size={14} />, description: 'Monthly books done for you' },
        { icon: <Check size={14} />, description: 'Complete financial reports and end of year tax packet' },
      ],
      unit: '/month',
      pricing: '$599',
      valueProposition: bookkeepingValueProps.map(vp => ({
        ...vp,
        text: this.bindTextValues(vp.text, platformConfig),
      })),
    }
  }

  /**
   * Use an existing base offer and overwrite portions of its content.
   *
   * When you want to create your own config, you can create your own `LandingPageConfig`.
   *
   * @see LandingPageHelper.createBaseAccountingOffer
   * @see LandingPageHelper.createBaseBookkeepingOffer
   * @see LandingPageConfig
   */
  static overwriteBaseOffer(
    defaults: LandingPageConfig,
    partial: Partial<LandingPageConfig>,
  ): LandingPageConfig {
    return {
      badge: partial.badge ?? defaults.badge,
      title: partial.title ?? defaults.title,
      description: partial.description ?? defaults.description,
      features: partial.features ?? defaults.features,
      pricing: partial.pricing ?? defaults.pricing,
      unit: partial.unit ?? defaults.unit,
      cta: partial.cta ?? defaults.cta,
      valueProposition: partial.valueProposition ?? defaults.valueProposition,
    }
  }

  /**
   * Creates a ContentConfig with the default config content provided for Layer's
   * accounting and bookkeeping offerings.
   *
   * @see LandingPageDefaultContentConfig - contains the default text content for the LandingPage component.
   */
  static createContentConfig(config: PartialContentConfig): ContentConfig {
    // Process config array to handle partial configs
    const processedConfig = config.config.map((item, index) => {
      // If it's already a complete LandingPageConfig, return as is
      if ('badge' in item && 'title' in item && 'description' in item && 'features' in item
        && 'pricing' in item && 'unit' in item && 'cta' in item && 'valueProposition' in item) {
        return item as LandingPageConfig
      }

      // If it's a partial config, we need defaults to merge with
      // For now, throw an error if no defaults are available
      throw new Error(`Partial LandingPage config at index ${index} requires a default config to merge with. Please provide complete LandingPage configs or use a merge helper.`)
    })

    return {
      textContent: {
        ...LandingPageDefaultTextContent,
        ...config.textContent,
      },
      features: config.features ?? landingPageDefaultContentConfig.features,
      config: processedConfig,
    }
  }
}
