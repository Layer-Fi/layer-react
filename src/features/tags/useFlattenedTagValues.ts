import { useMemo } from 'react'

import type { useTagDimensions } from '@features/tags/api/useTagDimensions'
import { makeTagValue, type TagDimensionSchema } from '@features/tags/tagSchemas'

function flattenDimensionsToValues(dimensions: ReadonlyArray<typeof TagDimensionSchema.Type>) {
  return dimensions.flatMap(({ id: dimensionId, key: dimensionKey, definedValues, displayName: dimensionDisplayName }) => {
    const values = definedValues.map(({ id: valueId, value: value, displayName: valueDisplayName, archivedAt }) => makeTagValue({
      dimensionId,
      dimensionKey,
      dimensionDisplayName: dimensionDisplayName,
      valueId,
      value,
      valueDisplayName: valueDisplayName,
      isArchived: !!archivedAt,
    }))

    return values
  },
  )
}

export function useFlattenedTagValues(dimensions: ReturnType<typeof useTagDimensions>['data']) {
  return useMemo(() => {
    if (dimensions === undefined) {
      return []
    }

    return flattenDimensionsToValues(dimensions)
  }, [dimensions])
}
