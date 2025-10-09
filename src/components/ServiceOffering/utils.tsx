import { HeroContentConfig, ServiceOfferingCardConfig, DeepPartial } from './types'

/**
 * Deep merges two objects, with the override taking precedence over the defaults
 * @param defaults The default configuration
 * @param overrides The partial overrides to apply
 * @returns A merged object with overrides applied to defaults
 */
function deepMerge<T>(defaults: T, overrides: DeepPartial<T>): T {
  const result = { ...defaults }

  for (const key in overrides) {
    const overrideValue = overrides[key]
    if (overrideValue !== undefined) {
      const defaultValue = defaults[key]

      // If both values are objects (but not arrays or null), merge recursively
      if (
        typeof overrideValue === 'object'
        && overrideValue !== null
        && !Array.isArray(overrideValue)
        && typeof defaultValue === 'object'
        && defaultValue !== null
        && !Array.isArray(defaultValue)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        result[key] = deepMerge(defaultValue, overrideValue as any)
      }
      else {
        result[key] = overrideValue as T[Extract<keyof T, string>]
      }
    }
  }

  return result
}

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
  return deepMerge(defaults, overrides)
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
  return deepMerge(defaults, overrides)
}
