import { ReactNode } from 'react'
import { ServiceOfferingConfig, ServiceOfferingOfferLayout } from './types'

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
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='18' height='19' viewBox='0 0 18 19' fill='none'>
          <path d='M9 2L1.5 5.75L9 9.5L16.5 5.75L9 2Z' stroke='#888888' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M1.5 13.25L9 17L16.5 13.25' stroke='#888888' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M1.5 9.5L9 13.25L16.5 9.5' stroke='#888888' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      ),
      title: 'All your finances in one place',
      text: 'Directly integrated with your {platformName} data, so you can see your business performance and profit in real-time.',
    },
    {
      icon: (
        <svg xmlns='http://www.w3.org/2000/svg' width='18' height='19' viewBox='0 0 18 19' fill='none'>
          <g clipPath='url(#clip0_9929_102393)'>
            <path d='M14.55 11.75C14.4502 11.9762 14.4204 12.2271 14.4645 12.4704C14.5086 12.7137 14.6246 12.9382 14.7975 13.115L14.8425 13.16C14.982 13.2993 15.0926 13.4647 15.1681 13.6468C15.2436 13.8289 15.2824 14.0241 15.2824 14.2213C15.2824 14.4184 15.2436 14.6136 15.1681 14.7957C15.0926 14.9778 14.982 15.1432 14.8425 15.2825C14.7032 15.422 14.5378 15.5326 14.3557 15.6081C14.1736 15.6836 13.9784 15.7224 13.7812 15.7224C13.5841 15.7224 13.3889 15.6836 13.2068 15.6081C13.0247 15.5326 12.8593 15.422 12.72 15.2825L12.675 15.2375C12.4982 15.0646 12.2737 14.9486 12.0304 14.9045C11.7871 14.8604 11.5362 14.8902 11.31 14.99C11.0882 15.0851 10.899 15.2429 10.7657 15.4442C10.6325 15.6454 10.561 15.8812 10.56 16.1225V16.25C10.56 16.6478 10.402 17.0294 10.1207 17.3107C9.83936 17.592 9.45782 17.75 9.06 17.75C8.66217 17.75 8.28064 17.592 7.99934 17.3107C7.71804 17.0294 7.56 16.6478 7.56 16.25V16.1825C7.55419 15.9343 7.47384 15.6935 7.32938 15.4915C7.18493 15.2896 6.98305 15.1357 6.75 15.05C6.52379 14.9502 6.27286 14.9204 6.02956 14.9645C5.78626 15.0086 5.56176 15.1246 5.385 15.2975L5.34 15.3425C5.20069 15.482 5.03526 15.5926 4.85316 15.6681C4.67106 15.7436 4.47587 15.7824 4.27875 15.7824C4.08163 15.7824 3.88644 15.7436 3.70434 15.6681C3.52224 15.5926 3.35681 15.482 3.2175 15.3425C3.07804 15.2032 2.9674 15.0378 2.89191 14.8557C2.81642 14.6736 2.77757 14.4784 2.77757 14.2812C2.77757 14.0841 2.81642 13.8889 2.89191 13.7068C2.9674 13.5247 3.07804 13.3593 3.2175 13.22L3.2625 13.175C3.4354 12.9982 3.55139 12.7737 3.5955 12.5304C3.63962 12.2871 3.60984 12.0362 3.51 11.81C3.41493 11.5882 3.25707 11.399 3.05585 11.2657C2.85463 11.1325 2.61884 11.061 2.3775 11.06H2.25C1.85218 11.06 1.47064 10.902 1.18934 10.6207C0.908035 10.3394 0.75 9.95782 0.75 9.56C0.75 9.16217 0.908035 8.78064 1.18934 8.49934C1.47064 8.21804 1.85218 8.06 2.25 8.06H2.3175C2.56575 8.05419 2.8065 7.97384 3.00847 7.82938C3.21045 7.68493 3.36429 7.48305 3.45 7.25C3.54984 7.02379 3.57962 6.77286 3.5355 6.52956C3.49139 6.28626 3.3754 6.06176 3.2025 5.885L3.1575 5.84C3.01804 5.70069 2.9074 5.53526 2.83191 5.35316C2.75642 5.17106 2.71757 4.97587 2.71757 4.77875C2.71757 4.58163 2.75642 4.38644 2.83191 4.20434C2.9074 4.02224 3.01804 3.85681 3.1575 3.7175C3.29681 3.57804 3.46224 3.4674 3.64434 3.39191C3.82644 3.31642 4.02163 3.27757 4.21875 3.27757C4.41587 3.27757 4.61106 3.31642 4.79316 3.39191C4.97526 3.4674 5.14069 3.57804 5.28 3.7175L5.325 3.7625C5.50176 3.9354 5.72626 4.05139 5.96956 4.0955C6.21285 4.13962 6.46379 4.10984 6.69 4.01H6.75C6.97183 3.91493 7.16101 3.75707 7.29427 3.55585C7.42753 3.35463 7.49904 3.11884 7.5 2.8775V2.75C7.5 2.35218 7.65804 1.97064 7.93934 1.68934C8.22064 1.40804 8.60218 1.25 9 1.25C9.39782 1.25 9.77935 1.40804 10.0607 1.68934C10.342 1.97064 10.5 2.35218 10.5 2.75V2.8175C10.501 3.05884 10.5725 3.29463 10.7057 3.49585C10.839 3.69707 11.0282 3.85493 11.25 3.95C11.4762 4.04984 11.7271 4.07962 11.9704 4.0355C12.2137 3.99139 12.4382 3.8754 12.615 3.7025L12.66 3.6575C12.7993 3.51804 12.9647 3.4074 13.1468 3.33191C13.3289 3.25642 13.5241 3.21757 13.7213 3.21757C13.9184 3.21757 14.1136 3.25642 14.2957 3.33191C14.4778 3.4074 14.6432 3.51804 14.7825 3.6575C14.922 3.79681 15.0326 3.96224 15.1081 4.14434C15.1836 4.32644 15.2224 4.52163 15.2224 4.71875C15.2224 4.91587 15.1836 5.11106 15.1081 5.29316C15.0326 5.47526 14.922 5.64069 14.7825 5.78L14.7375 5.825C14.5646 6.00176 14.4486 6.22626 14.4045 6.46956C14.3604 6.71285 14.3902 6.96379 14.49 7.19V7.25C14.5851 7.47183 14.7429 7.66101 14.9442 7.79427C15.1454 7.92753 15.3812 7.99904 15.6225 8H15.75C16.1478 8 16.5294 8.15804 16.8107 8.43934C17.092 8.72064 17.25 9.10218 17.25 9.5C17.25 9.89782 17.092 10.2794 16.8107 10.5607C16.5294 10.842 16.1478 11 15.75 11H15.6825C15.4412 11.001 15.2054 11.0725 15.0042 11.2057C14.8029 11.339 14.6451 11.5282 14.55 11.75Z' stroke='#888888' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M9 11.75C10.2426 11.75 11.25 10.7426 11.25 9.5C11.25 8.25736 10.2426 7.25 9 7.25C7.75736 7.25 6.75 8.25736 6.75 9.5C6.75 10.7426 7.75736 11.75 9 11.75Z' stroke='#888888' strokeLinecap='round' strokeLinejoin='round' />
          </g>
          <defs>
            <clipPath id='clip0_9929_102393'>
              <rect width='18' height='18' fill='white' transform='translate(0 0.5)' />
            </clipPath>
          </defs>
        </svg>
      ),
      title: 'Built for {industry}',
      text: 'Track your expenses and get easy to understand reports designed specifically for {industry} businesses.',
    },
  ],
}

/**
 * Creates a ServiceOffering config with overrides applied to a base config
 * @param base - Base ServiceOffering config
 * @param overrides - Partial overrides to apply
 * @returns Complete ServiceOffering config with overrides applied
 */
export function createServiceOfferingConfig(
  defaults: ServiceOfferingConfig,
  partial: Partial<ServiceOfferingConfig>,
): ServiceOfferingConfig {
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
 * Factory function to create ContentConfig with base defaults and user overrides
 * @param config - Partial configuration to override defaults
 * @returns Complete ContentConfig with   d defaults and overrides
 */
export function createContentConfig(config: PartialContentConfig): ContentConfig {
  // Process config array to handle partial configs
  const processedConfig = config.config.map((item, index) => {
    // If it's already a complete ServiceOfferingConfig, return as is
    if ('badge' in item && 'title' in item && 'description' in item && 'features' in item
      && 'pricing' in item && 'unit' in item && 'cta' in item && 'valueProposition' in item) {
      return item as ServiceOfferingConfig
    }

    // If it's a partial config, we need defaults to merge with
    // For now, throw an error if no defaults are available
    throw new Error(`Partial ServiceOffering config at index ${index} requires a default config to merge with. Please provide complete ServiceOffering configs or use a merge helper.`)
  })

  return {
    textContent: {
      ...ServiceOfferingDefaultTextContent,
      ...config.textContent,
    },
    layout: config.layout ?? defaultContentConfig.layout,
    features: config.features ?? defaultContentConfig.features,
    config: processedConfig,
  }
}
