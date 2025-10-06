import { HeroContentConfigOverridesResolved, HeroContentConfigOverrides, ServiceOfferingConfigOverridesResolved, ServiceOfferingConfigOverrides } from './types'

/**
 * Merges main content config overrides with defaults.
 * @param defaults The default override values (must be complete)
 * @param overrides The partial overrides to merge
 * @returns A merged HeroContentConfigOverridesResolved object with all keys required
 */
export function mergeHeroContentOverrides(
  defaults: HeroContentConfigOverridesResolved,
  overrides: HeroContentConfigOverrides,
): HeroContentConfigOverridesResolved {
  return {
    stringOverrides: { ...defaults.stringOverrides, ...overrides.stringOverrides },
    mediaUrls: { ...defaults.mediaUrls, ...overrides.mediaUrls },
    cta: { ...defaults.cta, ...overrides.cta },
  }
}

/**
   * Merges service offering config overrides with defaults.
   * @param defaults The default override values (must be complete)
   * @param overrides The partial overrides to merge
   * @returns A merged ServiceOfferingConfigOverridesResolved object with all keys required
   */
export function mergeServiceOfferingOverrides(
  defaults: ServiceOfferingConfigOverridesResolved,
  overrides: ServiceOfferingConfigOverrides,
): ServiceOfferingConfigOverridesResolved {
  return {
    offerType: defaults.offerType,
    stringOverrides: { ...defaults.stringOverrides, ...overrides.stringOverrides },
    mediaUrls: { ...defaults.mediaUrls, ...overrides.mediaUrls },
    cta: { ...defaults.cta, ...overrides.cta },
  }
}
