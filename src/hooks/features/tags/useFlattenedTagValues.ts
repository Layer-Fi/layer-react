import { useMemo } from 'react'

import { makeTagValue, type TagDimensionSchema } from '@schemas/tag'
import type { useTagDimensions } from '@hooks/api/businesses/[business-id]/tags/dimensions/useTagDimensions'

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
