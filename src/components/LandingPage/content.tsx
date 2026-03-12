import { type ReactNode } from 'react'
import i18next from 'i18next'

import { type HeroContentConfig, type LandingPageCardConfig, type LandingPageConfig } from '@components/LandingPage/types'
import { imagePartnerAccountingImage } from '@assets/images'

export type CoreValueProposition = {
  icon: ReactNode
  title: string
  text: string
}

export type LandingPageTypesTextContent = Record<LandingPageContentID, string>

/**
 * The LandingPageContentID is an enum of all the different kinds of text used on the base service offer configs
 * for the various Landing Pages.
 *
 * In general, there are 3 sections on the LandingPage page component: (1) Top-of-the-fold main content section,
 * (2) Core value proposition content section, (3) Landing Page content section.
 *
 * Using these enums as keys allows you to overwrite specific textual content on the different sections defined on the base configs.
 * @see LandingPageHelper.createBaseAccountingOffer
 * @see LandingPageHelper.createBaseBookkeepingOffer
 */
export enum LandingPageContentID {
  /**
   * The top most header text on section 1, top-of-the-fold main content section.
   *
   * When left blank, uses black color for the platform name, and a grayed out color on the word 'Accounting'.
   * Otherwise, uses a purely black color for the title.
   */
  title,
  /**
   * The text below the top most header text on the LandingPage page.
   */
  subtitle,
  /**
   * The first of two headlines on the core value proposition content section.
   */
  headline1,
  /**
   * The descriptive text below headline_1.
   */
  headline1Desc,
  /**
   * The second headline on the core value proposition content section.
   */
  headline2,
  /**
   * The descriptive text below headline_2.
   */
  headline2Desc,
  /**
   * The title for the value proposition section (section 2).
   */
  valuePropositionTitle,
  /**
   * The title for the Landing Pages section (section 3).
   */
  offersTitle,
}

export const LandingPageDefaultTextContent: LandingPageTypesTextContent = {
  [LandingPageContentID.title]: '', // When left blank, uses a dark and grayed out color
  [LandingPageContentID.subtitle]: i18next.t('trackYourBusinessFinancesRightWithinPlatformNameWithPeriod', 'Track your business finances, right within {{platformName}}.'),
  [LandingPageContentID.headline1]: i18next.t('allYourFinancesInOnePlace', 'All your finances in one place'),
  [LandingPageContentID.headline1Desc]: i18next.t('directlyIntegratedWithYourPlatformNameDataSoYouCanSeeYourBusinessPerformanceAndProfitInRealtime', 'Directly integrated with your {{platformName}} data, so you can see your business performance and profit in real-time.'),
  [LandingPageContentID.headline2]: i18next.t('builtForIndustry', 'Built for {{industry}}'),
  [LandingPageContentID.headline2Desc]: i18next.t('trackYourExpensesAndGetEasyToUnderstandReportsDesignedSpecificallyForIndustryBusinesses', 'Track your expenses and get easy to understand reports designed specifically for {{industry}} businesses.'),
  [LandingPageContentID.valuePropositionTitle]: i18next.t('selfserviceAccountingToUnderstandYourBusinessHealth', 'Self-service accounting to understand your business health'),
  [LandingPageContentID.offersTitle]: i18next.t('usePlatformNameAccountingYourselfOrLetOurTeamOfExpertsHandleBookkeepingForYou', 'Use {{platformName}} Accounting yourself, or let our team of experts handle bookkeeping for you'),
}

export interface ContentConfig {
  textContent?: LandingPageTypesTextContent
  features?: CoreValueProposition[]
  config: LandingPageConfig[]
}

/** Partial configuration type for overriding defaults */
export type PartialContentConfig = {
  textContent?: Partial<LandingPageTypesTextContent>
  features?: CoreValueProposition[]
  config: (LandingPageConfig | Partial<LandingPageConfig>)[]
}

/**
 * Provided default content configuration, which defines defaults for textual content
 * on the LandingPage.
 * @see LandingPage
 */
export const landingPageDefaultContentConfig: Omit<ContentConfig, 'config'> = {
  textContent: LandingPageDefaultTextContent,
  features: [
    {
      icon: <></>,
      title: i18next.t('allYourFinancesInOnePlace', 'All your finances in one place'),
      text: i18next.t('directlyIntegratedWithYourPlatformNameDataSoYouCanSeeYourBusinessPerformanceAndProfitInRealtime', 'Directly integrated with your {{platformName}} data, so you can see your business performance and profit in real-time.'),
    },
    {
      icon: <></>,
      title: i18next.t('builtForIndustry', 'Built for {{industry}}'),
      text: i18next.t('trackYourExpensesAndGetEasyToUnderstandReportsDesignedSpecificallyForIndustryBusinesses', 'Track your expenses and get easy to understand reports designed specifically for {{industry}} businesses.'),
    },
  ],
}

export const DefaultHeroContentConfig: HeroContentConfig = {
  stringOverrides: {
    title: i18next.t('platformNameAccounting', '{{platformName}} Accounting'),
    subtitle: i18next.t('trackYourBusinessFinancesRightWithinPlatformName', 'Track your business finances, right within {{platformName}}'),
    heading1: i18next.t('allYourFinancesInOnePlace', 'All your finances in one place'),
    heading1Desc: i18next.t('directlyIntegrateWithYourPlatformNameDataSoYouCanSeeYourBusinessPerformanceAndProfitInRealtime', 'Directly integrate with your {{platformName}} data, so you can see your business performance and profit in real-time.'),
    heading2: i18next.t('builtForIndustry', 'Built for {{industry}}'),
    heading2Desc: i18next.t('trackYourExpensesAndGetEasyToUnderstandReportsDesignedSpecificallyForIndustry', 'Track your expenses and get easy to understand reports designed specifically for {{industry}}.'),
  },
  mediaUrls: {
    topOfFoldImage: imagePartnerAccountingImage,
  },
  cta: {
    primary: {
      label: i18next.t('bookACall', 'Book a call'),
      url: 'https://www.google.com',
    },
    secondary: {
      label: i18next.t('learnMore', 'Learn more'),
      url: 'https://www.google.com',
    },
  },
}

export const DefaultAccountingOfferingConfig: LandingPageCardConfig = {
  offerType: 'accounting',
  stringOverrides: {
    badge: i18next.t('easyToUseSoftware', 'Easy to use software'),
    title: i18next.t('platformNameAccounting', '{{platformName}} Accounting'),
    subtitle: i18next.t('theBestAccountingSoftwareForIndustryBusinessesFastToSetUpAndEasyToUse', 'The best accounting software for {{industry}} businesses. Fast to set up and easy to use.'),
    priceAmount: '',
    priceUnit: '',
  },
  mediaUrls: {
    offerImage: '',
  },
  cta: {
    primary: {
      label: '',
      url: '',
    },
  },
  showStartingAtLabel: false,
}

export const DefaultBookkeepingOfferingConfig: LandingPageCardConfig = {
  offerType: 'bookkeeping',
  stringOverrides: {
    badge: i18next.t('aCompleteBookkeepingService', 'A complete bookkeeping service'),
    title: i18next.t('fullServiceBookkeeping', 'Full-service Bookkeeping'),
    subtitle: i18next.t('getADedicatedBookkeeperWhoWillOrganizeAndManageYourBooksForYou', 'Get a dedicated bookkeeper who will organize and manage your books for you.'),
    priceAmount: '',
    priceUnit: '',
  },
  mediaUrls: {
    offerImage: '',
  },
  cta: {
    primary: {
      label: '',
      url: '',
    },
  },
  showStartingAtLabel: false,
}
