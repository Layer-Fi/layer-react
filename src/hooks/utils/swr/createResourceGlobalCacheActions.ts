import { useCallback, useMemo } from 'react'

import { createTagPredicate, type InvalidateOptions, type PatchOptions } from '@hooks/utils/swr/globalCacheActionsShared'
import { type OptimisticUpdateOptions, useGlobalCacheActions } from '@hooks/utils/swr/useGlobalCacheActions'

export function createResourceGlobalCacheActions<TResource>(tagKey: string) {
  const matchesTag = createTagPredicate(tagKey)

  return function useResourceGlobalCacheActions() {
    const { invalidate, patchCache, optimisticUpdate, forceReload } = useGlobalCacheActions()

    const invalidateResource = useCallback(
      (options?: InvalidateOptions) => invalidate(matchesTag, options),
      [invalidate],
    )

    const forceReloadResource = useCallback(
      () => forceReload(matchesTag),
      [forceReload],
    )

    const overwriteCacheResource = useCallback(
      (data: TResource, options?: PatchOptions) =>
        patchCache<TResource>(matchesTag, () => data, options),
      [patchCache],
    )

    const patchCacheResource = useCallback(
      (transformResource: (resource?: TResource) => TResource | undefined, options?: PatchOptions) =>
        patchCache<TResource | undefined>(matchesTag, transformResource, options),
      [patchCache],
    )

    const optimisticUpdateResource = useCallback(
      (transformResource: (resource?: TResource) => TResource | undefined, options?: OptimisticUpdateOptions) =>
        optimisticUpdate<TResource | undefined>(matchesTag, transformResource, options),
      [optimisticUpdate],
    )

    return useMemo(() => ({
      invalidate: invalidateResource,
      forceReload: forceReloadResource,
      overwriteCache: overwriteCacheResource,
      patchCache: patchCacheResource,
      optimisticUpdate: optimisticUpdateResource,
    }), [invalidateResource, forceReloadResource, overwriteCacheResource, patchCacheResource, optimisticUpdateResource])
  }
}
