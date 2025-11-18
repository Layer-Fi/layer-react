import { type ReactNode } from 'react'

/**
 * A Link acts as a call-to-action for users interacting with the LandingPage component.
 * @see LandingPage
 */
export type LandingPageLink = {
  /** Text label displayed for the link. */
  label: string
  /** Destination for the link. If calendly URL, opens a Calendly modal. Otherwise, opens a new tab. */
  url: string
}

export type LandingPageFeature = string | { description: string, icon: ReactNode }

/**
 * The LandingPageValueProposition holds on to data that populates the value proposition
 * section.
 * @see LandingPage
 */
export type LandingPageValueProposition = {
  /** A visual icon or graphic element that represents this value proposition (e.g., SVG icon, emoji, or React component) */
  icon: ReactNode
  /** A short, compelling headline that summarizes the key benefit or feature */
  title: string
  /** A detailed description explaining how this value proposition helps the customer or what makes it valuable */
  text: string
}

/**
 * The LandingPageConfig holds on to data that populates the offerings section.
 * @see LandingPage
 */
export type LandingPageConfig = {
  /** A small label/tag displayed prominently on the service card (e.g., "Most Popular", "Recommended") */
  badge: string
  /** The main heading that identifies the Landing Page (e.g., "Full-Service Bookkeeping", "Self-Service Accounting") */
  title: string
  /** A brief summary explaining what this service package includes and who it's for */
  description: string
  /** A list of key benefits, capabilities, or included services that customers get with this offering */
  features: LandingPageFeature[]
  /** The cost display for this service (e.g., "$299", or empty string for "Contact Us"). If left as an empty string, will not render any text. */
  pricing: string
  /** The billing frequency or unit of measurement shown after the price (e.g., "/month", "/user", "/year").
   * If left as an empty string, will not render any text. */
  unit: string
  /** The call-to-action button configuration with label text and destination URL. The CTAs
   * supports Calendly links for booking an appointment. If not a Calendly link, a new tab
   * will be opened in visiting the link. */
  cta: LandingPageLink
  /**
   * An array of detailed selling points with icons, titles, and descriptions that highlight the unique benefits of this service.
   *
   * The defaults contain three value propositions each for accounting and bookkeeping.
   * */
  valueProposition: LandingPageValueProposition[]
}

/**
 * The LandingPage config defines the main CTA link and an optional learn more link.
 *
 * The main call-to-action usually points to a Calendly booking link, while the learn more
 * link points to an informational page about the offers.
 @see LandingPage
 */
export type LandingPageLinks = {
  /**
     * Main CTA link on the top-of-fold component.
     */
  main: LandingPageLink
  /**
     * Enables the learn more button, which allows a platform to link to a learn more page.
     *
     * If unspecified, the learn more button is not rendered.
     */
  learnMore?: LandingPageLink
}

/**
 * The PlatformConfig holds on to the name of the platform integrating with Layer, the primary
 * top-of-fold image shown on the LandingPage component, and the name of the platform's
 * niche or industry.
 @see LandingPage
 */
export interface LandingPagePlatformConfig {
  /**
     * The platform/brand name displayed throughout the component (e.g., "Shopify", "WooCommerce").
     * Used in titles, descriptions, and feature text to customize the content.
     */
  platformName: string

  /**
     * The target industry for customization (e.g., "e-commerce", "SaaS", "retail").
     * Used to tailor feature descriptions and messaging to the specific industry.
     *
     * In cases where the industry name substitution does not work well for the value
     * propositions or features, we recommended you overwrite the value propositions directly.
     *
    @see LandingPageValueProposition
     */
  industry: string
}

/**
 * Utility type for creating deep partial types - makes all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
}

/**
 * Configuration for the hero/main content section of the Landing Page page
 */
export type HeroContentConfig = {
  stringOverrides: {
    title: string
    subtitle: string
    heading1: string
    heading1Desc: string
    heading2: string
    heading2Desc: string
  }
  mediaUrls: {
    topOfFoldImage: string
  }
  cta: {
    primary: LandingPageLink
    secondary: LandingPageLink
  }
}

/**
 * Configuration for individual Landing Page cards (accounting or bookkeeping)
 */
export type LandingPageCardConfig = {
  offerType: 'accounting' | 'bookkeeping'
  stringOverrides: {
    badge: string
    title: string
    subtitle: string
    priceAmount: string
    priceUnit: string
  }
  mediaUrls: {
    offerImage: string
  }
  cta: {
    primary: LandingPageLink
  }
  showStartingAtLabel: boolean
}
