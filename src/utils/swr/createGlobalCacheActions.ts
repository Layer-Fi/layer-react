import { useCallback, useMemo } from 'react'

import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { type CacheKeyInfo } from '@utils/swr/withSWRKeyTags'

type InvalidateOptions = { withPrecedingOptimisticUpdate?: boolean }
type PatchOptions = { withRevalidate: boolean }

const createTagPredicate = (tagKey: string) => ({ tags }: CacheKeyInfo) => tags.includes(tagKey)

export function createResourceGlobalCacheActions<TResource>(tagKey: string) {
  const matchesTag = createTagPredicate(tagKey)

  return function useResourceGlobalCacheActions() {
    const { invalidate, patchCache, forceReload } = useGlobalCacheActions()

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

    return useMemo(() => ({
      invalidate: invalidateResource,
      forceReload: forceReloadResource,
      overwriteCache: overwriteCacheResource,
    }), [invalidateResource, forceReloadResource, overwriteCacheResource])
  }
}

type ListPage<TItem> = { data: ReadonlyArray<TItem> }

export function createInfiniteQueryGlobalCacheActions<TItem extends { id: string }>(tagKey: string) {
  const matchesTag = createTagPredicate(tagKey)

  type CachedList = ListPage<TItem>[] | ListPage<TItem>

  const buildInfiniteQueryTransform = (transformItem: (item: TItem) => TItem) => {
    const transformPage = (page: ListPage<TItem>): ListPage<TItem> => ({
      ...page,
      data: page.data.map(transformItem),
    })

    return (currentData?: CachedList) => {
      if (currentData === undefined) {
        return currentData
      }

      return Array.isArray(currentData)
        ? currentData.map(transformPage)
        : transformPage(currentData)
    }
  }

  return function useInfiniteQueryGlobalCacheActions() {
    const { invalidate, patchCache, optimisticUpdate, forceReload } = useGlobalCacheActions()

    const invalidateInfiniteQuery = useCallback(
      (options?: InvalidateOptions) => invalidate(matchesTag, options),
      [invalidate],
    )

    const forceReloadInfiniteQuery = useCallback(
      () => forceReload(matchesTag),
      [forceReload],
    )

    const patchByTransformation = useCallback(
      (transformItem: (item: TItem) => TItem, options?: PatchOptions) =>
        patchCache<CachedList | undefined>(matchesTag, buildInfiniteQueryTransform(transformItem), options),
      [patchCache],
    )

    const patchByKey = useCallback(
      (updatedItem: TItem, options?: PatchOptions) =>
        patchByTransformation(
          item => item.id === updatedItem.id ? updatedItem : item,
          options,
        ),
      [patchByTransformation],
    )

    const optimisticallyUpdate = useCallback(
      (transformItem: (item: TItem) => TItem) =>
        optimisticUpdate<CachedList | undefined>(matchesTag, buildInfiniteQueryTransform(transformItem)),
      [optimisticUpdate],
    )

    return useMemo(() => ({
      invalidate: invalidateInfiniteQuery,
      forceReload: forceReloadInfiniteQuery,
      patchByKey,
      patchByTransformation,
      optimisticallyUpdate,
    }), [invalidateInfiniteQuery, forceReloadInfiniteQuery, patchByKey, patchByTransformation, optimisticallyUpdate])
  }
}
