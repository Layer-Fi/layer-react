import { ReactNode } from 'react'

/**
 * Determines the layout out the ServiceOffering component, allowing you to position
 * the service offerings in different positions.
 */
export type ServiceOfferingOfferLayout = 'left' | 'bottom' | 'right' | 'none'

/**
 * A Link acts as a call-to-action for users interacting with the ServiceOffering component.
 @see ServiceOffering
 */
export type ServiceOfferingLink = {
  /** Text label displayed for the link. */
  label: string
  /** Destination for the link. If calendly URL, opens a Calendly modal. Otherwise, opens a new tab. */
  url: string
}

export type ServiceOfferingFeature = string | { description: string, icon: ReactNode }

/**
 * The ServiceOfferingValueProposition holds on to data that populates the value proposition
 * section.
 @see ServiceOffering
 */
export type ServiceOfferingValueProposition = {
  /** A visual icon or graphic element that represents this value proposition (e.g., SVG icon, emoji, or React component) */
  icon: ReactNode
  /** A short, compelling headline that summarizes the key benefit or feature */
  title: string
  /** A detailed description explaining how this value proposition helps the customer or what makes it valuable */
  text: string
}

/**
 * The ServiceOfferingConfig holds on to data that populates the offerings section.
 * @see ServiceOffering
 */
export type ServiceOfferingConfig = {
  /** A small label/tag displayed prominently on the service card (e.g., "Most Popular", "Recommended") */
  badge: string
  /** The main heading that identifies the service offering (e.g., "Full-Service Bookkeeping", "Self-Service Accounting") */
  title: string
  /** A brief summary explaining what this service package includes and who it's for */
  description: string
  /** A list of key benefits, capabilities, or included services that customers get with this offering */
  features: ServiceOfferingFeature[]
  /** The cost display for this service (e.g., "$299", or empty string for "Contact Us"). If left as an empty string, will not render any text. */
  pricing: string
  /** The billing frequency or unit of measurement shown after the price (e.g., "/month", "/user", "/year").
   * If left as an empty string, will not render any text. */
  unit: string
  /** The call-to-action button configuration with label text and destination URL. The CTAs
   * supports Calendly links for booking an appointment. If not a Calendly link, a new tab
   * will be opened in visiting the link. */
  cta: ServiceOfferingLink
  /**
   * An array of detailed selling points with icons, titles, and descriptions that highlight the unique benefits of this service.
   *
   * The defaults contain three value propositions each for accounting and bookkeeping.
   * */
  valueProposition: ServiceOfferingValueProposition[]
}

/**
 * The ServiceOffering config defines the main CTA link and an optional learn more link.
 *
 * The main call-to-action usually points to a Calendly booking link, while the learn more
 * link points to an informational page about the offers.
 @see ServiceOffering
 */
export type ServiceOfferingLinks = {
  /**
     * Main CTA link on the top-of-fold component.
     */
  main: ServiceOfferingLink
  /**
     * Enables the learn more button, which allows a platform to link to a learn more page.
     *
     * If unspecified, the learn more button is not rendered.
     */
  learnMore?: ServiceOfferingLink
}

/**
 * The PlatformConfig holds on to the name of the platform integrating with Layer, the primary
 * top-of-fold image shown on the ServiceOffering component, and the name of the platform's
 * niche or industry.
 @see ServiceOffering
 */
export interface ServiceOfferingPlatformConfig {
  /**
     * The platform/brand name displayed throughout the component (e.g., "Shopify", "WooCommerce").
     * Used in titles, descriptions, and feature text to customize the content.
     */
  platformName: string

  /**
     * The image URL to be used for the top-of-the-fold image.
     *
     * If left blank, will use a default.
     */
  imageUrl?: string

  /**
     * The target industry for customization (e.g., "e-commerce", "SaaS", "retail").
     * Used to tailor feature descriptions and messaging to the specific industry.
     *
     * In cases where the industry name substitution does not work well for the value
     * propositions or features, we recommended you overwrite the value propositions directly.
     *
    @see ServiceOfferingValueProposition
     */
  industry: string
}
