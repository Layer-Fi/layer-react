import { HeroContentConfig, LandingPageCardConfig, DeepPartial } from '@components/LandingPage/types'
import { merge } from 'lodash-es'

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
 * Merges Landing Page config overrides with defaults.
 * @param defaults The default configuration (must be complete)
 * @param overrides The partial overrides to merge
 * @returns A merged LandingPageCardConfig object with all keys required
 */
export function mergeLandingPageConfig(
  defaults: LandingPageCardConfig,
  overrides: DeepPartial<LandingPageCardConfig>,
): LandingPageCardConfig {
  return merge(defaults, overrides)
}
