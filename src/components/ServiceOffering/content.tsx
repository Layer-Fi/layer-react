import { ServiceOfferingConfig, ServiceOfferingOfferLayout } from './types'

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

  config: ServiceOfferingConfig[]
}
