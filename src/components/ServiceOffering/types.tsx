import { ReactNode } from 'react'

export type ServiceOfferingOfferLayout = 'left' | 'bottom' | 'right' | 'none'

export type Link = {
  label: string
  url: string
}

export type ServiceOfferingFeature = string | { description: string, icon: ReactNode }

export type ServiceOfferingValueProposition = {
  icon: ReactNode
  title: string
  text: string
}

export type ServiceOfferingConfig = {
  badge: string
  title: string
  description: string
  features: ServiceOfferingFeature[]
  pricing: string
  unit: string
  cta: Link
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
