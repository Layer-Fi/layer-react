import { type ReactNode } from 'react'
import type { TFunction } from 'i18next'

import { translationKey } from '@utils/shared/i18n/translationKey'
import { imagePartnerAccountingImage } from '@assets/images'
import { type HeroContentConfig, type LandingPageCardConfig, type LandingPageConfig } from '@views/LandingPage/types'

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

const TEXT_CONTENT_I18N = {
  [LandingPageContentID.subtitle]: translationKey('views:LandingPage.label.track_business_finances_within_platform', 'Track your business finances, right within {{platformName}}.'),
  [LandingPageContentID.headline1]: translationKey('views:LandingPage.label.all_finances_in_one_place', 'All your finances in one place'),
  [LandingPageContentID.headline1Desc]: translationKey('views:LandingPage.label.directly_integrated_with_platform_name', 'Directly integrated with your {{platformName}} data, so you can see your business performance and profit in real-time.'),
  [LandingPageContentID.headline2]: translationKey('views:LandingPage.label.built_for_industry', 'Built for {{industry}}'),
  [LandingPageContentID.headline2Desc]: translationKey('views:LandingPage.label.track_expenses_and_get_reports', 'Track your expenses and get easy to understand reports designed specifically for {{industry}} businesses.'),
  [LandingPageContentID.valuePropositionTitle]: translationKey('views:LandingPage.label.self_service_accounting_business_health', 'Self-service accounting to understand your business health'),
  [LandingPageContentID.offersTitle]: translationKey('views:LandingPage.label.use_platform_name_accounting', 'Use {{platformName}} Accounting yourself, or let our team of experts handle bookkeeping for you'),
} as const

export const buildLandingPageDefaultTextContent = (t: TFunction): LandingPageTypesTextContent => {
  const sub = TEXT_CONTENT_I18N[LandingPageContentID.subtitle]
  const h1 = TEXT_CONTENT_I18N[LandingPageContentID.headline1]
  const h1Desc = TEXT_CONTENT_I18N[LandingPageContentID.headline1Desc]
  const h2 = TEXT_CONTENT_I18N[LandingPageContentID.headline2]
  const h2Desc = TEXT_CONTENT_I18N[LandingPageContentID.headline2Desc]
  const vp = TEXT_CONTENT_I18N[LandingPageContentID.valuePropositionTitle]
  const offers = TEXT_CONTENT_I18N[LandingPageContentID.offersTitle]
  return {
    [LandingPageContentID.title]: '',
    [LandingPageContentID.subtitle]: t(sub.i18nKey, sub.defaultValue),
    [LandingPageContentID.headline1]: t(h1.i18nKey, h1.defaultValue),
    [LandingPageContentID.headline1Desc]: t(h1Desc.i18nKey, h1Desc.defaultValue),
    [LandingPageContentID.headline2]: t(h2.i18nKey, h2.defaultValue),
    [LandingPageContentID.headline2Desc]: t(h2Desc.i18nKey, h2Desc.defaultValue),
    [LandingPageContentID.valuePropositionTitle]: t(vp.i18nKey, vp.defaultValue),
    [LandingPageContentID.offersTitle]: t(offers.i18nKey, offers.defaultValue),
  }
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

const HERO_CONTENT_I18N = {
  title: translationKey('views:LandingPage.label.platform_name_accounting', '{{platformName}} Accounting'),
  subtitle: translationKey('views:LandingPage.label.track_business_finances_within_platform', 'Track your business finances, right within {{platformName}}.'),
  heading1: translationKey('views:LandingPage.label.all_finances_in_one_place', 'All your finances in one place'),
  heading1Desc: translationKey('views:LandingPage.label.directly_integrated_with_platform_name', 'Directly integrated with your {{platformName}} data, so you can see your business performance and profit in real-time.'),
  heading2: translationKey('views:LandingPage.label.built_for_industry', 'Built for {{industry}}'),
  heading2Desc: translationKey('views:LandingPage.label.track_expenses_and_get_reports', 'Track your expenses and get easy to understand reports designed specifically for {{industry}} businesses.'),
  bookACall: translationKey('views:LandingPage.action.book_call', 'Book a call'),
  learnMore: translationKey('views:LandingPage.action.learn_more', 'Learn more'),
} as const

export const buildDefaultHeroContentConfig = (t: TFunction): HeroContentConfig => ({
  stringOverrides: {
    title: t(HERO_CONTENT_I18N.title.i18nKey, HERO_CONTENT_I18N.title.defaultValue),
    subtitle: t(HERO_CONTENT_I18N.subtitle.i18nKey, HERO_CONTENT_I18N.subtitle.defaultValue),
    heading1: t(HERO_CONTENT_I18N.heading1.i18nKey, HERO_CONTENT_I18N.heading1.defaultValue),
    heading1Desc: t(HERO_CONTENT_I18N.heading1Desc.i18nKey, HERO_CONTENT_I18N.heading1Desc.defaultValue),
    heading2: t(HERO_CONTENT_I18N.heading2.i18nKey, HERO_CONTENT_I18N.heading2.defaultValue),
    heading2Desc: t(HERO_CONTENT_I18N.heading2Desc.i18nKey, HERO_CONTENT_I18N.heading2Desc.defaultValue),
  },
  mediaUrls: {
    topOfFoldImage: imagePartnerAccountingImage,
  },
  cta: {
    primary: {
      label: t(HERO_CONTENT_I18N.bookACall.i18nKey, HERO_CONTENT_I18N.bookACall.defaultValue),
      url: 'https://www.google.com',
    },
    secondary: {
      label: t(HERO_CONTENT_I18N.learnMore.i18nKey, HERO_CONTENT_I18N.learnMore.defaultValue),
      url: 'https://www.google.com',
    },
  },
})

const ACCOUNTING_OFFERING_I18N = {
  badge: translationKey('views:LandingPage.label.easy_to_use_software', 'Easy to use software'),
  title: translationKey('views:LandingPage.label.platform_name_accounting', '{{platformName}} Accounting'),
  subtitle: translationKey('views:LandingPage.label.best_accounting_software_for_industry', 'The best accounting software for {{industry}} businesses. Fast to set up and easy to use.'),
} as const

export const buildDefaultAccountingOfferingConfig = (t: TFunction): LandingPageCardConfig => ({
  offerType: 'accounting',
  stringOverrides: {
    badge: t(ACCOUNTING_OFFERING_I18N.badge.i18nKey, ACCOUNTING_OFFERING_I18N.badge.defaultValue),
    title: t(ACCOUNTING_OFFERING_I18N.title.i18nKey, ACCOUNTING_OFFERING_I18N.title.defaultValue),
    subtitle: t(ACCOUNTING_OFFERING_I18N.subtitle.i18nKey, ACCOUNTING_OFFERING_I18N.subtitle.defaultValue),
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
})

const BOOKKEEPING_OFFERING_I18N = {
  badge: translationKey('views:LandingPage.label.complete_bookkeeping_service', 'A complete bookkeeping service'),
  title: translationKey('views:LandingPage.label.full_service_bookkeeping', 'Full-service Bookkeeping'),
  subtitle: translationKey('views:LandingPage.label.get_dedicated_bookkeeper', 'Get a dedicated bookkeeper who will organize and manage your books for you.'),
} as const

export const buildDefaultBookkeepingOfferingConfig = (t: TFunction): LandingPageCardConfig => ({
  offerType: 'bookkeeping',
  stringOverrides: {
    badge: t(BOOKKEEPING_OFFERING_I18N.badge.i18nKey, BOOKKEEPING_OFFERING_I18N.badge.defaultValue),
    title: t(BOOKKEEPING_OFFERING_I18N.title.i18nKey, BOOKKEEPING_OFFERING_I18N.title.defaultValue),
    subtitle: t(BOOKKEEPING_OFFERING_I18N.subtitle.i18nKey, BOOKKEEPING_OFFERING_I18N.subtitle.defaultValue),
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
})

const DEFAULT_FEATURES_I18N = [
  {
    title: translationKey('views:LandingPage.label.all_finances_in_one_place', 'All your finances in one place'),
    text: translationKey('views:LandingPage.label.directly_integrated_with_platform_name', 'Directly integrated with your {{platformName}} data, so you can see your business performance and profit in real-time.'),
  },
  {
    title: translationKey('views:LandingPage.label.built_for_industry', 'Built for {{industry}}'),
    text: translationKey('views:LandingPage.label.track_expenses_and_get_reports', 'Track your expenses and get easy to understand reports designed specifically for {{industry}} businesses.'),
  },
] as const

export const buildLandingPageDefaultContentConfig = (t: TFunction): Omit<ContentConfig, 'config'> => ({
  textContent: buildLandingPageDefaultTextContent(t),
  features: DEFAULT_FEATURES_I18N.map(f => ({
    icon: <></>,
    title: t(f.title.i18nKey, f.title.defaultValue),
    text: t(f.text.i18nKey, f.text.defaultValue),
  })),
})
