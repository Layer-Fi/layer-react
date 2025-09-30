import { ServiceOfferingConfig, ServiceOfferingOfferLayout } from './types'

import { ReactNode } from 'react'

export type CoreValueProposition = {
  icon: ReactNode
  title: string
  text: string
}

export type ServiceOfferingTypesTextContent = Record<ServiceOfferingContentID, string>

export enum ServiceOfferingContentID {
  title,
  subtitle,
  headline_1,
  headline_1_desc,
  headline_2,
  headline_2_desc,
  value_proposition_title,
  offers_title,
}

export const ServiceOfferingDefaultTextContent: ServiceOfferingTypesTextContent = {
  [ServiceOfferingContentID.title]: '', // defaults to {platformName} Accounting
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
     * Allows you to optionally configure the text on the component.
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

  config: ServiceOfferingConfig[]
}

/** Partial configuration type for overriding defaults */
export type PartialContentConfig = {
  textContent?: Partial<ServiceOfferingTypesTextContent>
  layout?: ServiceOfferingOfferLayout
  features?: CoreValueProposition[]
  config: (ServiceOfferingConfig | Partial<ServiceOfferingConfig>)[]
}

/** Default content configuration */
export const defaultContentConfig: Omit<ContentConfig, 'config'> = {
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
