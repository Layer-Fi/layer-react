import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'

/**
 * Shared animation utilities. They are not variants of any one block, so they stay classes rather
 * than data attributes, and the composer lives here so the legacy names are seeded once.
 */
const legacyClassNames = createLegacyClassNames({
  'Layer__Animation--rotating': 'Layer__anim--rotating',
  'Layer__Animation--skeletonLoading': 'Layer__anim--skeleton-loading',
})

export const ROTATING_CLASS_NAME = legacyClassNames('Layer__Animation--rotating')
export const SKELETON_LOADING_CLASS_NAME = legacyClassNames('Layer__Animation--skeletonLoading')
