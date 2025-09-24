import { ReactNode } from 'react'

export type ServiceOfferingOfferLayout = 'left' | 'bottom' | 'right' | 'none'

export type Link = {
  label: string
  url: string
}

export type ServiceOfferingFeature = string | { description: string, icon: ReactNode }

export type ServiceOfferingValueProposition = {
  /** A visual icon or graphic element that represents this value proposition (e.g., SVG icon, emoji, or React component) */
  icon: ReactNode
  /** A short, compelling headline that summarizes the key benefit or feature */
  title: string
  /** A detailed description explaining how this value proposition helps the customer or what makes it valuable */
  text: string
}

export type ServiceOfferingConfig = {
  /** A small label/tag displayed prominently on the service card (e.g., "Most Popular", "Recommended") */
  badge: string
  /** The main heading that identifies the service offering (e.g., "Full-Service Bookkeeping", "Self-Service Accounting") */
  title: string
  /** A brief summary explaining what this service package includes and who it's for */
  description: string
  /** A list of key benefits, capabilities, or included services that customers get with this offering */
  features: ServiceOfferingFeature[]
  /** The cost display for this service (e.g., "$299", or empty string for "Contact Us") */
  pricing: string
  /** The billing frequency or unit of measurement shown after the price (e.g., "/month", "/user", "/year") */
  unit: string
  /** The call-to-action button configuration with label text and destination URL (supports Calendly links for booking) */
  cta: Link
  /** An array of detailed selling points with icons, titles, and descriptions that highlight the unique benefits of this service */
  valueProposition: ServiceOfferingValueProposition[]
}

export type ServiceOfferingLinks = {
  /**
     * Main CTA link on the top-of-fold component.
     */
  main: Link
  /**
     * Enables the learn more button, which allows a platform to link to a learn more page.
     */
  learnMore?: Link
}

export interface PlatformConfig {
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
     */
  industry: string
}
