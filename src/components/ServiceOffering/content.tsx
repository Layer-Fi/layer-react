import { ServiceOfferingConfig, ServiceOfferingOfferLayout } from './types'

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
  headline_1,
  /**
   * The descriptive text below headline_1.
   */
  headline_1_desc,
  /**
   * The second headline on the core value proposition content section.
   */
  headline_2,
  /**
   * The descriptive text below headline_2.
   */
  headline_2_desc,
  /**
   * The title for the value proposition section (section 2).
   */
  value_proposition_title,
  /**
   * The title for the service offerings section (section 3).
   */
  offers_title,
}

export const ServiceOfferingDefaultTextContent: ServiceOfferingTypesTextContent = {
  [ServiceOfferingContentID.title]: '', // When left blank, uses a dark and grayed out color
  [ServiceOfferingContentID.subtitle]: 'Track your business finances, right within {platformName}.',
  [ServiceOfferingContentID.headline_1]: 'All your finances in one place',
  [ServiceOfferingContentID.headline_1_desc]: 'Directly integrated with your {platformName} data, so you can see your business performance and profit in real-time.',
  [ServiceOfferingContentID.headline_2]: 'Built for {industry}',
  [ServiceOfferingContentID.headline_2_desc]: 'Track your expenses and get easy to understand reports designed specifically for Coffee Shop businesses.',
  [ServiceOfferingContentID.value_proposition_title]: 'Self-service accounting to understand your business health',
  [ServiceOfferingContentID.offers_title]: 'Use {platformName} Accounting yourself, or let our team of experts handle bookkeeping for you',
}

export interface ContentConfig {
  /**
   * Allows you to optionally configure the text on the component, mostly information about the first section of
   * the ServiceOffering component: the main content/top-of-the-fold section.
   */
  textContent?: ServiceOfferingTypesTextContent

  /**
     * Controls the positioning of the service options panel.
     * @default 'none'
     * - 'left': Options panel appears on the left side
     * - 'right': Options panel appears on the right side
     * - 'bottom': Options panel appears below the main content
     * - 'none': No options panel is displayed
     */
  layout?: ServiceOfferingOfferLayout

  /** Core features displayed in the main content area showcasing key platform benefits */
  features?: CoreValueProposition[]

  /**
   * Allows you to customize the third section of the ServiceOffering component: the service offerings section.
   * This section contains details about the specific offer details, their features, and pricing details.
   *
   * You have two options: (1) leverage pre-defined Layer defaults using the `createBaseAccountingOffer` and
   * `createBaseBookkeepingOffer` and wrap it using `overwriteBaseOffer`; or
   *
   * you can (2) define your own ServiceOfferingConfig completely from scratch.
   @see ServiceOfferingHelper.overwriteBaseOffer
   @see ServiceOfferingHelper.createBaseAccountingOffer
   @see ServiceOfferingHelper.createBaseBookkeepingOffer
   */
  config: ServiceOfferingConfig[]
}

/** Partial configuration type for overriding defaults */
export type PartialContentConfig = {
  /**
   * Allows you to configure the text on the component, mostly information about the first section of
   * the ServiceOffering component: the main content/top-of-the-fold section.
   *
   @see ServiceOfferingHelper.createBaseAccountingOffer
   @see ServiceOfferingHelper.createBaseBookkeepingOffer
   @see ServiceOfferingDefaultTextContent
   */
  textContent?: Partial<ServiceOfferingTypesTextContent>
  /**
   * Allows you to override the layout position for the service offerings.
   */
  layout?: ServiceOfferingOfferLayout
  /**
   * Allows you to configure the textual content on the second section of the ServiceOffering component: the core value propositions section.
   */
  features?: CoreValueProposition[]
  /**
   * Allows you to customize details about the third section of the ServiceOffering component: the service offerings section.
   *
   * You have two options: (1) leverage pre-defined Layer defaults using the `createBaseAccountingOffer` and
   * `createBaseBookkeepingOffer` and then wrap it using `overwriteBaseOffer`; or
   *
   * you can (2) define your own ServiceOfferingConfig completely from scratch.
   @see ServiceOfferingHelper.overwriteBaseOffer
   @see ServiceOfferingHelper.createBaseAccountingOffer
   @see ServiceOfferingHelper.createBaseBookkeepingOffer
   */
  config: (ServiceOfferingConfig | Partial<ServiceOfferingConfig>)[]
}

/**
 * Provided default content configuration, which defines defaults for textual content
 * on the ServiceOffering.
 @see ServiceOffering
 */
export const serviceOfferingDefaultContentConfig: Omit<ContentConfig, 'config'> = {
  textContent: ServiceOfferingDefaultTextContent,
  layout: 'none',
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
