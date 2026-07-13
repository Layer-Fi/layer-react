import { useCallback, useMemo } from 'react'

import { createTagPredicate, type InvalidateOptions, type PatchOptions } from '@hooks/utils/swr/globalCacheActionsShared'
import { useGlobalCacheActions } from '@hooks/utils/swr/useGlobalCacheActions'

type ListPage<TItem> = { data: ReadonlyArray<TItem> }

export function createInfiniteQueryGlobalCacheActions<TItem extends { id: string }>(tagKey: string) {
  const matchesTag = createTagPredicate(tagKey)

  type CachedList = ListPage<TItem>[] | ListPage<TItem>

  const buildInfiniteQueryTransform = (transformItem: (item: TItem) => TItem) => {
    const transformPage = (page: ListPage<TItem>): ListPage<TItem> => ({
      ...page,
      data: page.data.map(transformItem),
    })

    return (currentData?: CachedList | null) => {
      if (currentData === null || currentData === undefined) return currentData

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
        patchCache<CachedList | null | undefined>(matchesTag, buildInfiniteQueryTransform(transformItem), options),
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
        optimisticUpdate<CachedList | null | undefined>(matchesTag, buildInfiniteQueryTransform(transformItem)),
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
