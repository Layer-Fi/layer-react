import { imagePartnerAccountingImage } from '../../assets/images'
import { HeroContentConfigOverridesResolved, ServiceOfferingConfig, ServiceOfferingConfigOverridesResolved } from './types'

import { ReactNode } from 'react'

export type CoreValueProposition = {
  icon: ReactNode
  title: string
  text: string
}

export type ServiceOfferingTypesTextContent = Record<ServiceOfferingContentID, string>

/**
 * The ServiceOfferingContentID is an enum of all the different kinds of text used on the base service offer configs
 * for the various service offerings.
 *
 * In general, there are 3 sections on the ServiceOffering page component: (1) Top-of-the-fold main content section,
 * (2) Core value proposition content section, (3) Service offering content section.
 *
 * Using these enums as keys allows you to overwrite specific textual content on the different sections defined on the base configs.
 @see ServiceOfferingHelper.createBaseAccountingOffer
 @see ServiceOfferingHelper.createBaseBookkeepingOffer
 */
export enum ServiceOfferingContentID {
  /**
   * The top most header text on section 1, top-of-the-fold main content section.
   *
   * When left blank, uses black color for the platform name, and a grayed out color on the word 'Accounting'.
   * Otherwise, uses a purely black color for the title.
   */
  title,
  /**
   * The text below the top most header text on the ServiceOffering page.
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
   * The title for the service offerings section (section 3).
   */
  offersTitle,
}

export const ServiceOfferingDefaultTextContent: ServiceOfferingTypesTextContent = {
  [ServiceOfferingContentID.title]: '', // When left blank, uses a dark and grayed out color
  [ServiceOfferingContentID.subtitle]: 'Track your business finances, right within {platformName}.',
  [ServiceOfferingContentID.headline1]: 'All your finances in one place',
  [ServiceOfferingContentID.headline1Desc]: 'Directly integrated with your {platformName} data, so you can see your business performance and profit in real-time.',
  [ServiceOfferingContentID.headline2]: 'Built for {industry}',
  [ServiceOfferingContentID.headline2Desc]: 'Track your expenses and get easy to understand reports designed specifically for Coffee Shop businesses.',
  [ServiceOfferingContentID.valuePropositionTitle]: 'Self-service accounting to understand your business health',
  [ServiceOfferingContentID.offersTitle]: 'Use {platformName} Accounting yourself, or let our team of experts handle bookkeeping for you',
}

export interface ContentConfig {
  textContent?: ServiceOfferingTypesTextContent
  features?: CoreValueProposition[]
  config: ServiceOfferingConfig[]
}

/** Partial configuration type for overriding defaults */
export type PartialContentConfig = {
  textContent?: Partial<ServiceOfferingTypesTextContent>
  features?: CoreValueProposition[]
  config: (ServiceOfferingConfig | Partial<ServiceOfferingConfig>)[]
}

/**
 * Provided default content configuration, which defines defaults for textual content
 * on the ServiceOffering.
 @see ServiceOffering
 */
export const serviceOfferingDefaultContentConfig: Omit<ContentConfig, 'config'> = {
  textContent: ServiceOfferingDefaultTextContent,
  features: [
    {
      icon: <></>,
      title: 'All your finances in one place',
      text: 'Directly integrated with your {platformName} data, so you can see your business performance and profit in real-time.',
    },
    {
      icon: <></>,
      title: 'Built for {industry}',
      text: 'Track your expenses and get easy to understand reports designed specifically for {industry} businesses.',
    },
  ],
}

export const DefaultHeroContentConfig: HeroContentConfigOverridesResolved = {
  stringOverrides: {
    title: '{platformName} Accounting',
    subtitle: 'Track your business finances, right within {platformName}',
    heading1: 'All your finances in one place',
    heading1Desc: 'Directly integrate with your {platformName} data, so you can see your business performance and profit in real-time.',
    heading2: 'Built for {industry}',
    heading2Desc: 'Track your expenses and get easy to understand reports designed specifically for {industry} businesses.',
  },
  mediaUrls: {
    top_of_fold_image: imagePartnerAccountingImage,
  },
  cta: {
    primary: {
      label: 'Book a call',
      url: 'https://www.google.com',
    },
    secondary: {
      label: 'Learn more',
      url: 'https://www.google.com',
    },
  },
}

export const DefaultAccountingOfferingContentConfig: ServiceOfferingConfigOverridesResolved = {
  offerType: 'accounting',
  stringOverrides: {
    badge: 'Easy to use software',
    title: '{platformName} Accounting',
    subtitle: 'The best accounting software for {industry} businesses. Fast to set up and easy to use.',
    priceAmount: '',
    priceUnit: '',
  },
  mediaUrls: {
    offer_image: '',
  },
  cta: {
    primary: {
      label: '',
      url: '',
    },
  },
}

export const DefaultBookkeepingOfferingContentConfig: ServiceOfferingConfigOverridesResolved = {
  offerType: 'bookkeeping',
  stringOverrides: {
    badge: 'A complete bookkeeping service',
    title: 'Full-service Bookkeeping',
    subtitle: 'Get a dedicated bookkeeper who will organize and manage your books for you.',
    priceAmount: '',
    priceUnit: '',
  },
  mediaUrls: {
    offer_image: '  ',
  },
  cta: {
    primary: {
      label: '',
      url: '',
    },
  },
}
