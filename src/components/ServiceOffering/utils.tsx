import { HeroContentConfig, ServiceOfferingCardConfig, DeepPartial } from './types'
import { merge } from 'lodash'

/**
 * Merges hero content config overrides with defaults.
 * @param defaults The default configuration (must be complete)
 * @param overrides The partial overrides to merge
 * @returns A merged HeroContentConfig object with all keys required
 */
export function mergeHeroContentConfig(
  defaults: HeroContentConfig,
  overrides: DeepPartial<HeroContentConfig>,
): HeroContentConfig {
  return merge(defaults, overrides)
}

/**
 * Merges service offering config overrides with defaults.
 * @param defaults The default configuration (must be complete)
 * @param overrides The partial overrides to merge
 * @returns A merged ServiceOfferingCardConfig object with all keys required
 */
export function mergeServiceOfferingConfig(
  defaults: ServiceOfferingCardConfig,
  overrides: DeepPartial<ServiceOfferingCardConfig>,
): ServiceOfferingCardConfig {
  return merge(defaults, overrides)
}
